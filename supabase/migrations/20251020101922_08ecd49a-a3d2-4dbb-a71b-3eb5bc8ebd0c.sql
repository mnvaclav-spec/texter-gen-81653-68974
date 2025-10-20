-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'educator', 'student', 'user');
CREATE TYPE public.doc_visibility AS ENUM ('private', 'team', 'public');
CREATE TYPE public.notification_type AS ENUM ('draft_reminder', 'collaboration', 'template_update', 'assignment');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Document versions table
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  template TEXT NOT NULL,
  audience TEXT NOT NULL,
  detail_level TEXT NOT NULL,
  format TEXT NOT NULL,
  input TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(document_id, version_number)
);

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Templates library table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_type TEXT NOT NULL,
  default_audience TEXT DEFAULT 'general',
  default_detail_level TEXT DEFAULT 'intermediate',
  default_format TEXT DEFAULT 'markdown',
  sample_input TEXT,
  is_official BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Document sharing table
CREATE TABLE public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  visibility doc_visibility NOT NULL DEFAULT 'private',
  share_token TEXT UNIQUE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_members UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0
);

ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- User analytics table
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doc_type TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  generation_time_ms INTEGER,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5)
);

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Learning progress table
CREATE TABLE public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  quiz_score INTEGER CHECK (quiz_score BETWEEN 0 AND 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Assignments table (for education mode)
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  doc_type TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID[] DEFAULT ARRAY[]::UUID[],
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Assignment submissions table
CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  grade INTEGER CHECK (grade BETWEEN 0 AND 100),
  feedback TEXT,
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Document versions policies
CREATE POLICY "Users can view versions of their documents"
  ON public.document_versions FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_versions.document_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions"
  ON public.document_versions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Templates policies
CREATE POLICY "Anyone can view templates"
  ON public.templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create custom templates"
  ON public.templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
  ON public.templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage official templates"
  ON public.templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Document shares policies
CREATE POLICY "Users can view shares for their documents"
  ON public.document_shares FOR SELECT
  TO authenticated
  USING (
    shared_by = auth.uid() OR
    auth.uid() = ANY(team_members) OR
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_shares.document_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares for their documents"
  ON public.document_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      WHERE id = document_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own shares"
  ON public.document_shares FOR UPDATE
  TO authenticated
  USING (shared_by = auth.uid());

-- Analytics policies
CREATE POLICY "Users can view their own analytics"
  ON public.user_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics"
  ON public.user_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Educators and admins can view all analytics"
  ON public.user_analytics FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'educator')
  );

-- Learning progress policies
CREATE POLICY "Users can view their own progress"
  ON public.learning_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.learning_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Educators can view student progress"
  ON public.learning_progress FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'educator') OR public.has_role(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Assignments policies
CREATE POLICY "Students can view assigned work"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = ANY(assigned_to) OR
    auth.uid() = created_by OR
    public.has_role(auth.uid(), 'educator') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Educators can create assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'educator') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Educators can update their assignments"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    public.has_role(auth.uid(), 'admin')
  );

-- Assignment submissions policies
CREATE POLICY "Students can view their own submissions"
  ON public.assignment_submissions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id OR
    public.has_role(auth.uid(), 'educator') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Students can create submissions"
  ON public.assignment_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Educators can grade submissions"
  ON public.assignment_submissions FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'educator') OR
    public.has_role(auth.uid(), 'admin')
  );

-- Triggers for updated_at
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default official templates
INSERT INTO public.templates (name, description, category, template_type, is_official, sample_input) VALUES
('REST API Documentation', 'Complete REST API documentation with endpoints, authentication, and examples', 'API', 'rest-api', true, 'User management API with CRUD operations'),
('Docker Setup Guide', 'Docker containerization setup and deployment guide', 'DevOps', 'docker', true, 'Node.js application with PostgreSQL database'),
('Linux Installation', 'Step-by-step Linux software installation guide', 'System', 'linux', true, 'Install and configure Nginx web server'),
('React Component', 'React component documentation with props and usage', 'Frontend', 'react', true, 'Reusable button component with variants'),
('Python Module', 'Python module/package documentation', 'Backend', 'python', true, 'Data processing utility functions'),
('Database Schema', 'Database schema design and relationship documentation', 'Database', 'database', true, 'E-commerce product catalog schema');
// Base type definitions
export interface SignUpFormData {
  firstName: string;
  otherName: string;
  surname: string;
  username: string;
  email: string;
  matricNumber: string;
  password: string;
}

export interface User extends SignUpFormData {
  id: number;
  fullName: string;
  role: string;
  status: string;
  profilePicture: string | null;
}

export type CurrentUser = Omit<User, 'password'>;

// Firebase User Profile interface
export interface FirebaseUserProfile {
  uid: string;
  email: string;
  firstName: string;
  otherName: string;
  surname: string;
  username: string;
  matricNumber: string;
  fullName: string;
  role: 'Student' | 'Admin' | 'Class President';
  status: 'active' | 'suspended' | 'banned';
  profilePicture?: string;
  emailVerified: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  units: string;
}

export type CoursesData = Record<string, Record<string, Course[]>>;

export interface Document {
  id: number;
  name: string;
  type: string;
  data: string; // base64
}

export interface Message {
  id: number;
  from: number;
  to: number;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Notification {
  id: number;
  userId: number;
  text: string;
  read: boolean;
  timestamp: number;
  link?: { page: string; [key: string]: any };
}

export type Route = {
  page: string;
  [key: string]: any;
};

// Feature-specific type definitions
export interface GpaEntry {
  id: number;
  userId: number;
  courseCode: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  units: number;
  semester: string;
}

export interface Faculty {
  id: number;
  name: string;
  title: string;
  email: string;
  office: string;
  courses: string[];
  profilePicture: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  courseCode: string;
}

export interface Resource extends Document {
  courseCode: string;
  uploaderId: number;
  title: string;
}

export interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: number;
  title: string;
  courseCode: string;
  questions: QuizQuestion[];
  creatorId: number;
}

export interface QuizSubmission {
  id: number;
  quizId: number;
  userId: number;
  answers: (number | null)[];
  score: number;
  timestamp: number;
}

export interface CustomGrade {
  id: number;
  userId: number;
  itemName: string;
  score: number;
  total: number;
  courseCode: string;
}

export interface ForumPost {
  id: number;
  authorId: number;
  content: string;
  timestamp: number;
}

export interface ForumThread {
  id: number;
  title: string;
  authorId: number;
  timestamp: number;
  posts: ForumPost[];
}

export interface Poll {
  id: number;
  question: string;
  options: { text: string; votes: number[] }[];
  createdBy: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'academic' | 'social' | 'deadline';
}

export interface CoursePlan {
  userId: number;
  semester: string; // e.g., "100 Level Harmattan"
  courseCodes: string[];
}

export interface TutorProfile {
  userId: number;
  rate: string;
  availability: string;
  subjects: string[]; // Course codes
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Internship' | 'Full-time' | 'Part-time';
  description: string;
  link: string;
  postedById: number;
}

export interface LostFoundItem {
  id: number;
  type: 'lost' | 'found';
  itemName: string;
  description: string;
  location: string;
  postedById: number;
  timestamp: number;
}

export interface PublicNote extends Document {
  title: string;
  authorId: number;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: number;
  title: string;
  courseCode: string;
  creatorId: number;
  cards: Flashcard[];
}

// Component prop interfaces
export interface AuthPageProps {
  onSignIn: (user: User) => void;
  onSignUp: (formData: SignUpFormData) => void;
  users: User[];
  approvedMatricNumbers: string[];
}

export interface SignUpFormProps {
  onSignUp: (formData: SignUpFormData) => void;
  users: User[];
  approvedMatricNumbers: string[];
}

export interface SignInFormProps {
  onSignIn: (user: User) => void;
  users: User[];
}

export interface SidebarProps {
  route: Route;
  setRoute: (route: Route) => void;
  isSidebarOpen: boolean;
}

export interface HeaderProps {
  currentUser: CurrentUser;
  onSignOut: () => void;
  notifications: Notification[];
  setRoute: (route: Route) => void;
  onMarkAsRead: (id: number) => void;
  onToggleSidebar: () => void;
}

export interface HomePageProps {
  currentUser: CurrentUser;
  announcements: Announcement[];
  setRoute: (route: Route) => void;
}

export interface AnnouncementsPageProps {
  announcements: Announcement[];
  currentUser: CurrentUser;
  onAddAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
}

export interface CoursesPageProps {
  coursesData: CoursesData;
}

export interface CoursePlannerPageProps {
  currentUser: CurrentUser;
  coursePlans: CoursePlan[];
  onUpdateCoursePlan: (plan: CoursePlan) => void;
  coursesData: CoursesData;
}

export interface FacultyDirectoryPageProps {
  faculty: Faculty[];
}

export interface AssignmentsPageProps {
  assignments: Assignment[];
  currentUser: CurrentUser;
  onAddAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  ALL_COURSE_CODES: string[];
}

export interface ResourceLibraryPageProps {
  resources: Resource[];
  currentUser: CurrentUser;
  onAddResource: (resource: Omit<Resource, 'id'>) => void;
  ALL_COURSE_CODES: string[];
}

export interface QuizzesPageProps {
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  currentUser: CurrentUser;
  setRoute: (route: Route) => void;
}

export interface CreateQuizPageProps {
  onAddQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  setRoute: (route: Route) => void;
  ALL_COURSE_CODES: string[];
}

export interface TakeQuizPageProps {
  quiz: Quiz;
  currentUser: CurrentUser;
  onSubmit: (submission: Omit<QuizSubmission, 'id'>) => void;
  setRoute: (route: Route) => void;
}

export interface QuizResultsPageProps {
  quiz: Quiz;
  submission: QuizSubmission;
  setRoute: (route: Route) => void;
}

export interface GradebookPageProps {
  currentUser: CurrentUser;
  customGrades: CustomGrade[];
  onAddCustomGrade: (grade: Omit<CustomGrade, 'id'>) => void;
  ALL_COURSE_CODES: string[];
}

export interface GpaCalculatorPageProps {
  currentUser: CurrentUser;
  gpaEntries: GpaEntry[];
  onAddGpaEntry: (entry: Omit<GpaEntry, 'id'>) => void;
}

export interface ForumsPageProps {
  threads: ForumThread[];
  currentUser: CurrentUser;
  onAddForumThread: (thread: Omit<ForumThread, 'id'>) => void;
  users: User[];
  setRoute: (route: Route) => void;
}

export interface ViewForumThreadPageProps {
  thread: ForumThread;
  users: User[];
  currentUser: CurrentUser;
  onAddPost: (threadId: number, post: Omit<ForumPost, 'id'>) => void;
  setRoute: (route: Route) => void;
}

export interface PollsPageProps {
  polls: Poll[];
  currentUser: CurrentUser;
  onAddPoll: (poll: Omit<Poll, 'id'>) => void;
  onVote: (pollId: number, optionIndex: number) => void;
}

export interface CalendarPageProps {
  events: CalendarEvent[];
  currentUser: CurrentUser;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

export interface MessagesPageProps {
  currentUser: CurrentUser;
  users: User[];
  messages: Message[];
  onSendMessage: (message: Omit<Message, 'id'>) => void;
  route: Route;
  setRoute: (route: Route) => void;
}

export interface TutoringMarketplacePageProps {
  currentUser: CurrentUser;
  users: User[];
  tutorProfiles: TutorProfile[];
  onRegisterTutor: (profile: Omit<TutorProfile, 'userId'>) => void;
}

export interface JobBoardPageProps {
  jobs: Job[];
  currentUser: CurrentUser;
  onAddJob: (job: Omit<Job, 'id'>) => void;
}

export interface LostAndFoundPageProps {
  items: LostFoundItem[];
  currentUser: CurrentUser;
  onAddItem: (item: Omit<LostFoundItem, 'id' | 'postedById' | 'timestamp'>) => void;
  users: User[];
}

export interface PublicNotesPageProps {
  currentUser: CurrentUser;
  publicNotes: PublicNote[];
  onAddPublicNote: (note: Omit<PublicNote, 'id' | 'authorId'>) => void;
  users: User[];
}

export interface ProfilePageProps {
  currentUser: CurrentUser;
  onUpdateUser: (user: CurrentUser) => void;
}

export interface AdminPanelPageProps {
  users: User[];
  onUpdateUserStatus: (userId: number, status: string) => void;
  onUpdateUserRole: (userId: number, role: string) => void;
  approvedMatricNumbers: string[];
  onAddMatricNumber: (matricNumber: string) => void;
  onRemoveMatricNumber: (matricNumber: string) => void;
  coursesData: CoursesData;
  onAddCourse: (level: string, semester: string, course: Omit<Course, 'id'>) => void;
  onUpdateCourse: (courseId: number, course: Partial<Course>) => void;
  onDeleteCourse: (courseId: number) => void;
  announcements: Announcement[];
  onUpdateAnnouncement: (id: number, announcement: Partial<Announcement>) => void;
  onDeleteAnnouncement: (id: number) => void;
  assignments: Assignment[];
  onUpdateAssignment: (id: number, assignment: Partial<Assignment>) => void;
  onDeleteAssignment: (id: number) => void;
  faculty: Faculty[];
  onAddFaculty: (faculty: Omit<Faculty, 'id'>) => void;
  onUpdateFaculty: (id: number, faculty: Partial<Faculty>) => void;
  onDeleteFaculty: (id: number) => void;
  quizzes: Quiz[];
  onDeleteQuiz: (id: number) => void;
  polls: Poll[];
  onDeletePoll: (id: number) => void;
  systemSettings: any;
  onUpdateSystemSettings: (settings: any) => void;
}

export interface FlashcardsPageProps {
  flashcardSets: FlashcardSet[];
  currentUser: CurrentUser;
  setRoute: (route: Route) => void;
}

export interface CreateFlashcardSetPageProps {
  onAddSet: (set: Omit<FlashcardSet, 'id'>) => void;
  setRoute: (route: Route) => void;
  ALL_COURSE_CODES: string[];
}

export interface ViewFlashcardSetPageProps {
  set: FlashcardSet;
  setRoute: (route: Route) => void;
}

export interface MembersPageProps {
  users: User[];
  setRoute: (route: Route) => void;
}
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from "@vercel/analytics/react";

// --- BASE TYPE DEFINITIONS ---
interface SignUpFormData {
    firstName: string;
    otherName: string;
    surname: string;
    username: string;
    email: string;
    matricNumber: string;
    password: string;
}
interface User extends SignUpFormData {
    id: number;
    fullName: string;
    role: string;
    status: string;
    profilePicture: string | null;
}
type CurrentUser = Omit<User, 'password'>;
interface Announcement {
    id: number;
    title: string;
    date: string;
    content: string;
}
interface Course {
    id: number;
    code: string;
    title: string;
    units: string;
}
type CoursesData = Record<string, Record<string, Course[]>>;
interface Document {
    id: number;
    name: string;
    type: string;
    data: string; // base64
}
interface Message {
    id: number;
    from: number;
    to: number;
    text: string;
    timestamp: number;
    read: boolean;
}
interface Notification {
    id: number;
    userId: number;
    text: string;
    read: boolean;
    timestamp: number;
    link?: { page: string; [key: string]: any };
}
type Route = {
    page: string;
    [key: string]: any;
};

// --- NEW FEATURE TYPE DEFINITIONS ---
interface GpaEntry {
    id: number;
    userId: number;
    courseCode: string;
    grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    units: number;
    semester: string;
}
interface Faculty {
    id: number;
    name: string;
    title: string;
    email: string;
    office: string;
    courses: string[];
    profilePicture: string;
}
interface Assignment {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    courseCode: string;
}
interface Resource extends Document {
    courseCode: string;
    uploaderId: number;
    title: string;
}
interface QuizQuestion {
    text: string;
    options: string[];
    correctAnswerIndex: number;
}
interface Quiz {
    id: number;
    title: string;
    courseCode: string;
    questions: QuizQuestion[];
    creatorId: number;
}
interface QuizSubmission {
    id: number;
    quizId: number;
    userId: number;
    answers: (number | null)[];
    score: number;
    timestamp: number;
}
interface CustomGrade {
    id: number;
    userId: number;
    itemName: string;
    score: number;
    total: number;
    courseCode: string;
}
interface ForumPost {
    id: number;
    authorId: number;
    content: string;
    timestamp: number;
}
interface ForumThread {
    id: number;
    title: string;
    authorId: number;
    timestamp: number;
    posts: ForumPost[];
}
interface Poll {
    id: number;
    question: string;
    options: { text: string; votes: number[] }[];
    createdBy: number;
}
interface CalendarEvent {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    type: 'academic' | 'social' | 'deadline';
}
interface CoursePlan {
    userId: number;
    semester: string; // e.g., "100 Level Harmattan"
    courseCodes: string[];
}
interface TutorProfile {
    userId: number;
    rate: string;
    availability: string;
    subjects: string[]; // Course codes
}
interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    type: 'Internship' | 'Full-time' | 'Part-time';
    description: string;
    link: string;
    postedById: number;
}
interface LostFoundItem {
    id: number;
    type: 'lost' | 'found';
    itemName: string;
    description: string;
    location: string;
    postedById: number;
    timestamp: number;
}
interface PublicNote extends Document {
    title: string;
    authorId: number;
}
interface Flashcard {
    id: number;
    front: string;
    back: string;
}
interface FlashcardSet {
    id: number;
    title: string;
    courseCode: string;
    creatorId: number;
    cards: Flashcard[];
}


// --- CONFIGURATION & INITIAL DATA ---
const ADMIN_EMAIL = 'oladoyeheritage445@gmail.com';
const INITIAL_MATRIC_NUMBERS = [ "2024013417", "2023011476", "2024003355", "ADMIN/001", "2024003476", "2024003486", "2024003513", "2024003516", "2024003580", "2024003583", "2024003607", "2024013214", "2024003667", "2024003692", "2024003712", "2024003741", "2024003770", "2024003869", "2024003999", "2024004028", "2024004029", "2024004099", "2024013216", "2024004177", "2024004271", "2024004308", "2024004334", "2024004407", "2024004417", "2024004487", "2024004507", "2024004527", "2024004576", "2024013223", "2024004590", "2024004622", "2024004637", "2024004691", "2024004703", "2024004723", "2024004794", "2024004798", "2024004808", "2024004869", "2024013378", "2024004891", "2024004893", "2024004895", "2024004932", "2024004947", "2024004956", "2024004962", "2024004973", "2024005008", "2024005013", "2024013391", "2024005068", "2024005150", "2024005156", "2024005157", "2024005182", "2024005345", "2024005353", "2024005378", "2024005477", "2024005507", "2024005508", "2024005528", "2024005546", "2024005655", "2024005738", "2024005753", "2024005754", "2024005797", "2024005847", "2024005864", "2024005867", "2024005916", "2024006090", "2024006118", "2024006125", "2024006136", "2024006143", "2024006150", "2024006162", "2024006198", "2024006437", "2024006447", "2024006477", "2024006510", "2024006513", "2024006550", "2024006564", "2024006597", "2024006626", "2024006686", "2024006705", "2024006820", "2024006896", "2024006904", "2024006969", "2024006978", "2024006998", "2024007000", "2024007087", "2024007117", "2024007153", "2024007169", "2024007175", "2024007310", "2024007325", "2024007467", "2024007512", "2024007527", "2024007578", "2024007587", "2024007588", "2024007589", "2024007663", "2024007675", "2024007681", "2024007693", "2024007696", "2024007744", "2024007756", "2024007796", "2024007814", "2024007823", "2024007944", "2024007974", "2024007977", "2024008002", "2024008028", "2024008059", "2024008076", "2024008087", "2024008233", "2024008338", "2024008357", "2024008415", "2024008420", "2024008458", "2024008554", "2024008575", "2024008612", "2024008680", "2024008710", "2024008757", "2024008761", "2024008777", "2024008838", "2024008890", "2024008929", "2024008942", "2024008971", "2024009104", "2024009209", "2024009324", "2024009342", "2024009347", "2024009384", "2024009455", "2024009461", "2024009479", "2024009537", "2024009587", "2024009652", "2024009736", "2024009834", "2024009872", "2024009874", "2024009932", "2024009937", "2024009967", "2024010177", "2024010178", "2024010194", "2024010213", "2024010379", "2024010502", "2024010544", "2024010624", "2024010690", "2024010710", "2024010829", "2024010853", "2024010866", "2024010883", "2024010985", "2024011008", "2024011028", "2024011047", "2024011048", "2024011125", "2024011144", "2024011160", "2024011162", "2024011316", "2024011351", "2024011367", "2024011464", "2024011522", "2024011526", "2024011567", "2024011593", "2024011630", "2024011850", "2024011924", "2024012314", "2024012318", "2024012400", "2024012493", "2024012547", "2024012628", "2024012666", "2024012674", "2024012792", "2024012879", "2024012918", "2024012939", "2024013017", "2024013035", "2024013060", "2024013164", "2024013180" ];
const INITIAL_COURSES_DATA: CoursesData = {
    "100 Level": {
        "Harmattan Semester": [
            { id: 101, code: "GST 111", title: "Communication in English", units: "2" },
            { id: 102, code: "ECO 101", title: "Principles of Economics I", units: "2" },
            { id: 103, code: "ECO 103", title: "Introductory Mathematics I", units: "2" },
            { id: 104, code: "ECO 105", title: "Intro to Statistics for Social Sciences I", units: "2" },
            { id: 105, code: "ECO 107", title: "Introduction to Finance", units: "2" },
            { id: 106, code: "LIB 101", title: "Use of Library, Study Skills & ICT", units: "2" },
            { id: 107, code: "ACC 101", title: "Principles of Accounting I", units: "2" },
            { id: 108, code: "MKT 101", title: "Elements of Marketing I", units: "2" },
            { id: 109, code: "SOC 111", title: "Intergroup Relations & Social Development", units: "2" },
            { id: 110, code: "PHL 109", title: "Philosophical Problems and Analysis", units: "2" },
            { id: 111, code: "ECO XXX", title: "Introduction to Digital (Elective)", units: "2" }
        ],
        "Rain Semester": [
            { id: 112, code: "GST 112", title: "Nigerian People and Culture", units: "2" },
            { id: 113, code: "ECO 102", title: "Principles of Economics II", units: "3" },
            { id: 114, code: "ECO 104", title: "Introductory Mathematics II", units: "2" },
            { id: 115, code: "ECO 106", title: "Stats for Social Sciences II", units: "2" },
            { id: 116, code: "ECO 108", title: "Intro to Information Technology", units: "3" },
            { id: 117, code: "ACC 102", title: "Principles of Accounting II", units: "3" },
            { id: 118, code: "MKT 102", title: "Elements of Marketing II", units: "2" },
            { id: 119, code: "ENG 104", title: "Basic Writing Skills", units: "2" },
            { id: 120, code: "POL 104", title: "Nigerian Legal System (Elective)", units: "2" }
        ]
    },
    "200 Level": {
        "Harmattan Semester": [
            { id: 201, code: "ENT 211", title: "Entrepreneurship and Innovation", units: "2" },
            { id: 202, code: "ECO 201", title: "Introduction to Micro Economics I", units: "2" },
            { id: 203, code: "ECO 203", title: "Introduction to Macro Economics I", units: "2" },
            { id: 204, code: "ECO 205", title: "Structure of Nigerian Economy", units: "2" },
            { id: 205, code: "ECO 207", title: "Mathematics for Economists I", units: "2" },
            { id: 206, code: "ECO 209", title: "Statistics for Economists I", units: "2" },
            { id: 207, code: "ECO 211", title: "Public Finance", units: "2" },
            { id: 208, code: "HIS 207", title: "History of the Commonwealth", units: "2" },
            { id: 209, code: "ECO 213", title: "Urban and Regional Economics (Elective)", units: "2" }
        ],
        "Rain Semester": [
            { id: 210, code: "GST 212", title: "Philosophy, Logic and Human Existence", units: "2" },
            { id: 211, code: "SSC 202", title: "Introduction to Computer", units: "3" },
            { id: 212, code: "ECO 202", title: "Micro Economics II", units: "2" },
            { id: 213, code: "ECO 204", title: "Macro Economics II", units: "2" },
            { id: 214, code: "ECO 206", title: "History of Economic Thought", units: "2" },
            { id: 215, code: "ECO 208", title: "Math for Economists II", units: "2" },
            { id: 216, code: "ECO 210", title: "Statistics for Economists II", units: "2" },
            { id: 217, code: "ECO 214", title: "Transport Economics", units: "2" },
            { id: 218, code: "ECO 216", title: "Labour Economics", units: "2" }
        ]
    },
     "300 Level": {
        "Harmattan Semester": [
            { id: 301, code: "SSC 301", title: "Innovation in Social Sciences", units: "2" },
            { id: 302, code: "ECO 301", title: "Intermediate Micro I", units: "2" },
            { id: 303, code: "ECO 303", title: "Intermediate Macro I", units: "2" },
            { id: 304, code: "ECO 305", title: "History of Economic Thoughts", units: "2" },
            { id: 305, code: "ECO 307", title: "Project Evaluation", units: "3" },
            { id: 306, code: "ECO 309", title: "Econometrics", units: "2" },
            { id: 307, code: "ECO 311", title: "Monetary Economics I", units: "2" },
            { id: 308, code: "ECO 313", title: "International Economics I", units: "2" },
            { id: 309, code: "ECO 315", title: "Economics of Development", units: "2" }
        ],
        "Rain Semester": [
            { id: 310, code: "GST 312", title: "Peace and Conflict Resolution", units: "2" },
            { id: 311, code: "ENT 312", title: "Venture Creation", units: "2" },
            { id: 312, code: "SSC 302", title: "Research Methods I", units: "2" },
            { id: 313, code: "ECO 302", title: "Intermediate Micro II", units: "2" },
            { id: 314, code: "ECO 304", title: "Intermediate Macro II", units: "2" },
            { id: 315, code: "ECO 306", title: "Introductory Econometrics", units: "3" },
            { id: 316, code: "ECO 308", title: "Operation Research", units: "2" },
            { id: 317, code: "ECO 310", title: "Public Sector Economics", units: "2" },
            { id: 318, code: "ECO 312", title: "Monetary Economics II", units: "2" },
            { id: 319, code: "ECO 314", title: "International Economics II", units: "2" },
            { id: 320, code: "ECO 3XX", title: "Industrial Economics (Elective)", units: "2" }
        ]
    },
    "400 Level": {
        "Harmattan Semester": [
            { id: 401, code: "SSC 401", title: "Research Methods II", units: "2" },
            { id: 402, code: "ECO 401", title: "Advanced Microeconomics", units: "2" },
            { id: 403, code: "ECO 403", title: "Advanced Macroeconomics", units: "2" },
            { id: 404, code: "ECO 405", title: "Economic Planning", units: "3" },
            { id: 405, code: "ECO 407", title: "Fiscal Policy and Analysis", units: "3" },
            { id: 406, code: "ECO 409", title: "Comparative Economic Systems", units: "2" },
            { id: 407, code: "ECO 411", title: "Advanced Mathematical Economics", units: "2" },
            { id: 408, code: "ECO 413", title: "Development: Problems & Policies", units: "2" },
            { id: 409, code: "ECO 415/417", title: "Econs of Production / Petroleum Econs", units: "2" }
        ],
        "Rain Semester": [
            { id: 410, code: "ECO 402", title: "Advanced Microeconomics II", units: "2" },
            { id: 411, code: "ECO 404", title: "Advanced Macroeconomics II", units: "2" },
            { id: 412, code: "ECO 406", title: "Project Evaluation II", units: "2" },
            { id: 413, code: "ECO 408", title: "Economic Planning II", units: "2" },
            { id: 414, code: "ECO 410", title: "Applied Statistics", units: "2" },
            { id: 415, code: "ECO 499", title: "Final Year Project", units: "6" },
            { id: 416, code: "ECO 412/414", title: "Advanced Econometrics / Health Econs", units: "2" }
        ]
    }
};

// --- HOOKS ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item === null) return initialValue;
            const value = JSON.parse(item) as T;
            return value;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};

// --- UTILS ---
const getFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- AUTHENTICATION & MEMBERS-ONLY COMPONENTS ---

interface AuthPageProps {
    onSignIn: (user: User) => void;
    onSignUp: (formData: SignUpFormData) => void;
    users: User[];
    approvedMatricNumbers: string[];
}
const AuthPage = ({ onSignIn, onSignUp, users, approvedMatricNumbers }: AuthPageProps) => {
    const [isSignUp, setIsSignUp] = useState(false);
    return (
        <div className="auth-page-wrapper">
            <div className="auth-page-container">
                <div className="auth-header">
                    <h1 className="logo">LAUTECH Economics '29</h1>
                    <h2>Community Portal</h2>
                </div>
                <div className="auth-card">
                    {isSignUp ? (
                        <SignUpForm onSignUp={onSignUp} users={users} approvedMatricNumbers={approvedMatricNumbers} />
                    ) : (
                        <SignInForm onSignIn={onSignIn} users={users} />
                    )}
                </div>
                <p className="auth-switch">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </a>
                </p>
            </div>
        </div>
    );
};

interface SignUpFormProps {
    onSignUp: (formData: SignUpFormData) => void;
    users: User[];
    approvedMatricNumbers: string[];
}
const SignUpForm = ({ onSignUp, users, approvedMatricNumbers }: SignUpFormProps) => {
    const [formData, setFormData] = useState({ firstName: '', otherName: '', surname: '', username: '', email: '', matricNumber: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.trim() }));
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!approvedMatricNumbers.includes(formData.matricNumber.toUpperCase())) {
            setError('This matric number is not on the approved list.');
            return;
        }
        if (users.some(user => user.matricNumber.toUpperCase() === formData.matricNumber.toUpperCase())) {
            setError('This matric number has already been registered.');
            return;
        }
        onSignUp(formData);
    };

    return (
        <>
            <h3 className="auth-title">Create Your Account</h3>
            <form onSubmit={handleSignUp} className="auth-form">
                {error && <p className="error-message">{error}</p>}
                <div className="form-group"><input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required /></div>
                <div className="form-group"><input type="text" name="otherName" placeholder="Other Name" value={formData.otherName} onChange={handleChange} /></div>
                <div className="form-group"><input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleChange} required /></div>
                <div className="form-group"><input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required /></div>
                <div className="form-group"><input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required /></div>
                <div className="form-group"><input type="text" name="matricNumber" placeholder="Matric Number" value={formData.matricNumber} onChange={handleChange} required /></div>
                <div className="form-group"><input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required /></div>
                <button type="submit" className="btn-primary" style={{width: '100%'}}>Sign Up</button>
            </form>
        </>
    );
};

interface SignInFormProps {
    onSignIn: (user: User) => void;
    users: User[];
}
const SignInForm = ({ onSignIn, users }: SignInFormProps) => {
    const [formData, setFormData] = useState({ matricNumber: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = users.find(u => u.matricNumber.toUpperCase() === formData.matricNumber.toUpperCase() && u.password === formData.password);
        if (user) {
            if (user.status === 'banned' || user.status === 'suspended') {
                 setError(`Your account has been ${user.status}. Please contact an administrator.`);
                 return;
            }
            onSignIn(user);
        } else {
            setError('Invalid matric number or password.');
        }
    };

    return (
        <>
            <h3 className="auth-title">Welcome Back!</h3>
            <form onSubmit={handleSignIn} className="auth-form">
                {error && <p className="error-message">{error}</p>}
                <div className="form-group"><input type="text" name="matricNumber" placeholder="Matric Number" value={formData.matricNumber} onChange={handleChange} required /></div>
                <div className="form-group"><input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required /></div>
                <button type="submit" className="btn-primary" style={{width: '100%'}}>Sign In</button>
            </form>
        </>
    );
};


// --- LAYOUT COMPONENTS ---
interface SidebarProps {
    route: Route;
    setRoute: (route: Route) => void;
    isSidebarOpen: boolean;
}
const Sidebar = ({ route, setRoute, isSidebarOpen }: SidebarProps) => {
    const navLinks = [
        { page: 'home', label: 'Home' },
        { page: 'announcements', label: 'Announcements' },
        { page: 'courses', label: 'Courses' },
        { page: 'coursePlanner', label: 'Course Planner' },
        { page: 'faculty', label: 'Faculty Directory' },
        { page: 'assignments', label: 'Assignments' },
        { page: 'resourceLibrary', label: 'Resource Library' },
        { page: 'quizzes', label: 'Quizzes' },
        { page: 'flashcards', label: 'Flashcards' },
        { page: 'gradebook', label: 'Gradebook' },
        { page: 'gpaCalculator', label: 'GPA Calculator' },
        { page: 'forums', label: 'Forums' },
        { page: 'polls', label: 'Polls & Surveys' },
        { page: 'calendar', label: 'Calendar' },
        { page: 'members', label: 'Members Directory' },
        { page: 'messages', label: 'Messages' },
        { page: 'tutoring', label: 'Tutoring Marketplace' },
        { page: 'jobs', label: 'Job Board' },
        { page: 'lostAndFound', label: 'Lost & Found' },
        { page: 'publicNotes', label: 'Public Notes' },
    ];

    return (
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h1 className="logo">ECO'29</h1>
            </div>
            <nav className="sidebar-nav">
                {navLinks.map(link => (
                    <a
                        href="#"
                        key={link.page}
                        className={route.page === link.page ? 'active' : ''}
                        onClick={(e) => { e.preventDefault(); setRoute({ page: link.page }); }}
                    >
                        {link.label}
                    </a>
                ))}
            </nav>
        </aside>
    );
};

interface NotificationBellProps {
    notifications: Notification[];
    setRoute: (route: Route) => void;
    onMarkAsRead: (notificationId: number) => void;
}
const NotificationBell = ({ notifications, setRoute, onMarkAsRead }: NotificationBellProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        if (notification.link) {
            setRoute(notification.link);
        }
        setIsOpen(false);
    };

    return (
        <div className="notification-bell">
            <button onClick={() => setIsOpen(!isOpen)} className="notification-btn" aria-label={`Notifications (${unreadCount} unread)`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>Notifications</h4>
                    </div>
                    {notifications.length > 0 ? (
                        <ul className="notification-list">
                            {notifications.map(n => (
                                <li key={n.id} className={n.read ? 'read' : 'unread'} onClick={() => handleNotificationClick(n)}>
                                    <p>{n.text}</p>
                                    <small>{new Date(n.timestamp).toLocaleString()}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-notifications">No new notifications.</p>
                    )}
                </div>
            )}
        </div>
    );
};

interface HeaderProps {
    currentUser: CurrentUser;
    onSignOut: () => void;
    notifications: Notification[];
    setRoute: (route: Route) => void;
    onMarkAsRead: (notificationId: number) => void;
    onToggleSidebar: () => void;
}
const Header = ({ currentUser, onSignOut, notifications, setRoute, onMarkAsRead, onToggleSidebar }: HeaderProps) => {
    const isAdmin = currentUser.role === 'Class President' || currentUser.role === 'Admin';
    return (
        <header className="header">
            <button className="sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="header-controls">
                {isAdmin && <button className="btn-secondary" onClick={() => setRoute({ page: 'admin' })}>Admin Panel</button>}
                <NotificationBell notifications={notifications} setRoute={setRoute} onMarkAsRead={onMarkAsRead} />
                <a href="#" className="header-profile-link" onClick={(e) => { e.preventDefault(); setRoute({ page: 'profile' }); }} title="My Profile">
                    <img src={currentUser.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`} alt="Profile" className="header-profile-pic" />
                    <span>{currentUser.firstName}</span>
                </a>
                <button onClick={onSignOut} className="sign-out-btn">Sign Out</button>
            </div>
        </header>
    );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
}
const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};


// --- PAGE COMPONENTS ---

interface HomePageProps {
    currentUser: CurrentUser;
    announcements: Announcement[];
    setRoute: (route: Route) => void;
}
const HomePage = ({ currentUser, announcements, setRoute }: HomePageProps) => (
    <div>
        <div className="hero">
            <h1 className="welcome-message">Welcome, {currentUser.firstName}</h1>
            <p>Department of Economics Community Portal. Stay connected with course updates, announcements, and fellow students.</p>
        </div>
        <div className="home-grid">
            <section id="announcements-preview" className="content-section">
                <h2>Latest Announcements</h2>
                <div className="card">
                    {announcements.length > 0 ? (
                        announcements.slice(0, 3).map(item => (
                            <div key={item.id} style={{padding: '1rem', borderBottom: '1px solid var(--border-color)'}}>
                                <h3>{item.title}</h3>
                                <p className="date">{item.date}</p>
                                <div className="rendered-content" dangerouslySetInnerHTML={{ __html: item.content.substring(0,150) + '...' }}></div>
                            </div>
                        ))
                    ) : (
                        <p>No announcements yet.</p>
                    )}
                </div>
            </section>
            <aside>
                 <div className="card">
                    <h3>Quick Links</h3>
                     <nav className="sidebar-nav">
                        <a href="#" onClick={(e) => { e.preventDefault(); setRoute({ page: 'courses' }); }}>My Courses</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setRoute({ page: 'gradebook' }); }}>My Grades</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setRoute({ page: 'calendar' }); }}>University Calendar</a>
                    </nav>
                 </div>
            </aside>
        </div>
    </div>
);

interface AnnouncementsPageProps {
    announcements: Announcement[];
    currentUser: CurrentUser;
    onAddAnnouncement: (data: { title: string; content: string; }) => void;
}
const AnnouncementsPage = ({ announcements, currentUser, onAddAnnouncement }: AnnouncementsPageProps) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isAdmin = currentUser.role === 'Class President' || currentUser.role === 'Admin';
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    
    const handleFormat = (tag: 'b' | 'i' | 'ul') => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        if (tag === 'ul') {
            const listItems = selectedText.split('\n').map(item => `<li>${item}</li>`).join('');
            const newText = `<ul>\n${listItems}\n</ul>`;
             const updatedContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
            setFormData(prev => ({ ...prev, content: updatedContent }));
        } else {
            const newText = `<${tag}>${selectedText}</${tag}>`;
            const updatedContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
            setFormData(prev => ({ ...prev, content: updatedContent }));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title.trim() && formData.content.trim()) {
            onAddAnnouncement(formData);
            setFormData({ title: '', content: '' });
            setShowForm(false);
        }
    };

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Announcements</h1>
                    <p className="page-subtitle">Stay up-to-date with the latest news from the department.</p>
                </div>
                {isAdmin && <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Announcement'}</button>}
            </div>
            {showForm && (
                 <div className="card">
                     <form onSubmit={handleSubmit}>
                        <h3>New Announcement</h3>
                        <div className="form-group"><label>Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required /></div>
                        <div className="form-group rich-text-editor">
                            <label>Content</label>
                            <div className="toolbar">
                                <button type="button" onClick={() => handleFormat('b')}>B</button>
                                <button type="button" onClick={() => handleFormat('i')}>I</button>
                                <button type="button" onClick={() => handleFormat('ul')}>List</button>
                            </div>
                            <textarea ref={textareaRef} name="content" value={formData.content} onChange={handleChange} required></textarea>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-secondary">Post</button>
                        </div>
                    </form>
                 </div>
            )}
            
            {announcements.length > 0 ? (
                <div className="card-grid">
                    {announcements.map((item) => (
                        <div className="card" key={item.id}>
                            <h3>{item.title}</h3>
                            <p className="date">{item.date}</p>
                            <div className="rendered-content" dangerouslySetInnerHTML={{ __html: item.content }}></div>
                        </div>
                    ))}
                </div>
            ) : <div className="empty-state"><p>No announcements have been posted yet.</p></div>}
        </div>
    );
};

// --- NEWLY IMPLEMENTED PAGE COMPONENTS ---
interface CoursesPageProps {
    coursesData: CoursesData;
}
const CoursesPage = ({ coursesData }: CoursesPageProps) => {
    const [activeLevel, setActiveLevel] = useState("100 Level");
    const levels = Object.keys(coursesData);
    const activeSemesters = coursesData[activeLevel] || {};

    return (
        <div>
            <h1 className="page-title">Courses</h1>
            <p className="page-subtitle">Official course listings for the Economics program.</p>
            <div className="course-level-tabs">
                {levels.map(level => (
                    <button 
                        key={level} 
                        className={activeLevel === level ? 'active' : ''}
                        onClick={() => setActiveLevel(level)}
                    >
                        {level}
                    </button>
                ))}
            </div>
            <div className="level-semesters-grid">
                {Object.entries(activeSemesters).map(([semester, courses]) => (
                    <div className="semester-column card" key={semester}>
                        <h3>{semester}</h3>
                        <table className="course-list-table">
                            <thead>
                                <tr><th>Code</th><th>Title</th><th>Units</th></tr>
                            </thead>
                            <tbody>
                                {courses.map(course => (
                                    <tr key={course.id}>
                                        <td>{course.code}</td>
                                        <td>{course.title}</td>
                                        <td>{course.units}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface CoursePlannerPageProps {
    currentUser: CurrentUser;
    coursePlans: CoursePlan[];
    onUpdateCoursePlan: (semester: string, courseCodes: string[]) => void;
    coursesData: CoursesData;
}
const CoursePlannerPage = ({ currentUser, coursePlans, onUpdateCoursePlan, coursesData }: CoursePlannerPageProps) => {
    const [selectedSemester, setSelectedSemester] = useState('100 Level Harmattan Semester');
    
    const allSemesters = Object.entries(coursesData).flatMap(([level, semesters]) => 
        Object.keys(semesters).map(semester => `${level} ${semester}`)
    );
    
    const coursesForSemester = (level: string, semester: string): Course[] => {
        return coursesData[level]?.[semester] || [];
    };
    
    const [level, semesterName] = selectedSemester.split(/ (Harmattan|Rain) /);
    const availableCourses = coursesForSemester(level, `${semesterName} Semester`);
    
    const currentPlan = coursePlans.find(p => p.userId === currentUser.id && p.semester === selectedSemester) || { courseCodes: [] };
    
    const handleToggleCourse = (courseCode: string) => {
        const newCourseCodes = currentPlan.courseCodes.includes(courseCode)
            ? currentPlan.courseCodes.filter(c => c !== courseCode)
            : [...currentPlan.courseCodes, courseCode];
        onUpdateCoursePlan(selectedSemester, newCourseCodes);
    };

    const plannedCourses = availableCourses.filter(c => currentPlan.courseCodes.includes(c.code));
    const totalUnits = plannedCourses.reduce((acc, course) => acc + parseInt(course.units), 0);

    return (
        <div>
            <h1 className="page-title">Course Planner</h1>
            <p className="page-subtitle">Select your courses for each semester to plan your academic journey.</p>
            <div className="course-planner-grid">
                <div className="card">
                    <h3>Select Semester</h3>
                    <div className="form-group">
                        <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                            {allSemesters.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <h4>Available Courses for {selectedSemester}</h4>
                    <table className="course-list-table">
                        <thead>
                            <tr><th></th><th>Code</th><th>Title</th><th>Units</th></tr>
                        </thead>
                        <tbody>
                            {availableCourses.map(course => (
                                <tr key={course.id}>
                                    <td><input type="checkbox" checked={currentPlan.courseCodes.includes(course.code)} onChange={() => handleToggleCourse(course.code)} /></td>
                                    <td>{course.code}</td>
                                    <td>{course.title}</td>
                                    <td>{course.units}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card">
                    <h3>Your Plan for {selectedSemester}</h3>
                    {plannedCourses.length > 0 ? (
                        <>
                            {plannedCourses.map(course => (
                                <div className="planned-course" key={course.id}>
                                    <span><strong>{course.code}</strong> - {course.title} ({course.units} units)</span>
                                    <button className="btn-danger btn-sm" onClick={() => handleToggleCourse(course.code)}>Remove</button>
                                </div>
                            ))}
                            <hr />
                            <div style={{textAlign: 'right'}}>
                                <h4>Total Units: {totalUnits}</h4>
                            </div>
                        </>
                    ) : (
                        <p>No courses selected for this semester.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

interface FacultyDirectoryPageProps {
    faculty: Faculty[];
}
const FacultyDirectoryPage = ({ faculty }: FacultyDirectoryPageProps) => {
    return (
        <div>
            <h1 className="page-title">Faculty Directory</h1>
            <p className="page-subtitle">Meet the esteemed faculty of the Economics department.</p>
            <div className="directory-grid">
                {faculty.map(member => (
                    <div className="card faculty-card" key={member.id}>
                        <img src={member.profilePicture} alt={member.name} />
                        <h4>{member.name}</h4>
                        <p>{member.title}</p>
                        <p><a href={`mailto:${member.email}`}>{member.email}</a></p>
                        <p>Office: {member.office}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface AssignmentsPageProps {
    assignments: Assignment[];
    currentUser: CurrentUser;
    onAddAssignment: (data: Omit<Assignment, 'id'>) => void;
    ALL_COURSE_CODES: string[];
}
const AssignmentsPage = ({ assignments, currentUser, onAddAssignment, ALL_COURSE_CODES }: AssignmentsPageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', courseCode: '' });
    const isAdmin = currentUser.role === 'Class President' || currentUser.role === 'Admin';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddAssignment(formData);
        setIsModalOpen(false);
        setFormData({ title: '', description: '', dueDate: '', courseCode: '' });
    };

    const groupedAssignments = assignments.reduce((acc, item) => {
        (acc[item.courseCode] = acc[item.courseCode] || []).push(item);
        return acc;
    }, {} as Record<string, Assignment[]>);

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Assignments</h1>
                    <p className="page-subtitle">View upcoming and past assignments for your courses.</p>
                </div>
                {isAdmin && <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ New Assignment</button>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Assignment">
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Title</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
                    <div className="form-group"><label>Course Code</label>
                        <select value={formData.courseCode} onChange={e => setFormData({ ...formData, courseCode: e.target.value })} required>
                            <option value="">Select a course</option>
                            {ALL_COURSE_CODES.map(code => <option key={code} value={code}>{code}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label>Due Date</label><input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} required /></div>
                    <div className="form-group"><label>Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea></div>
                    <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-secondary">Post Assignment</button>
                    </div>
                </form>
            </Modal>

            {Object.keys(groupedAssignments).length > 0 ? (
                Object.entries(groupedAssignments).sort(([a], [b]) => a.localeCompare(b)).map(([courseCode, assignmentList]) => (
                    <div className="card" key={courseCode} style={{ marginBottom: '2rem' }}>
                        <h3>{courseCode}</h3>
                        {assignmentList.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(item => (
                             <div className="assignment-item" key={item.id}>
                                <div>
                                    <h4>{item.title}</h4>
                                    <p>{item.description}</p>
                                </div>
                                <div className="assignment-due-date">
                                    <strong>Due:</strong> {new Date(item.dueDate).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            ) : <div className="empty-state"><p>No assignments have been posted yet.</p></div>}
        </div>
    );
};

interface ResourceLibraryPageProps {
    resources: Resource[];
    currentUser: CurrentUser;
    onAddResource: (data: Omit<Resource, 'id'>) => void;
    ALL_COURSE_CODES: string[];
}
const ResourceLibraryPage = ({ resources, currentUser, onAddResource, ALL_COURSE_CODES }: ResourceLibraryPageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', courseCode: '' });
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!file || !formData.title || !formData.courseCode) {
            setError('All fields are required.');
            return;
        }
        try {
            const base64Data = await getFileAsBase64(file);
            onAddResource({
                title: formData.title,
                courseCode: formData.courseCode,
                uploaderId: currentUser.id,
                name: file.name,
                type: file.type,
                data: base64Data,
            });
            setFormData({ title: '', courseCode: '' });
            setFile(null);
            setIsModalOpen(false);
        } catch (err) {
            setError('Failed to upload file. Please try again.');
            console.error(err);
        }
    };
    
    const groupedResources = resources.reduce((acc, res) => {
        (acc[res.courseCode] = acc[res.courseCode] || []).push(res);
        return acc;
    }, {} as Record<string, Resource[]>);

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Resource Library</h1>
                    <p className="page-subtitle">Shared lecture notes, e-books, and past questions.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Upload Resource</button>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload New Resource">
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>Course Code</label>
                        <select value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} required>
                            <option value="">Select a course</option>
                            {ALL_COURSE_CODES.map(code => <option key={code} value={code}>{code}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>File</label>
                        <input type="file" onChange={handleFileChange} required />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-secondary">Upload</button>
                    </div>
                </form>
            </Modal>

            {Object.keys(groupedResources).length > 0 ? (
                Object.entries(groupedResources).sort(([a], [b]) => a.localeCompare(b)).map(([courseCode, resList]) => (
                    <div className="card" key={courseCode} style={{marginBottom: '2rem'}}>
                        <h3>{courseCode}</h3>
                        {resList.map(res => (
                            <div className="resource-item" key={res.id}>
                                <div>
                                    <strong>{res.title}</strong>
                                    <p style={{fontSize: '0.9rem', color: '#6B7280'}}>{res.name}</p>
                                </div>
                                <a href={res.data} download={res.name} className="btn-primary btn-sm">Download</a>
                            </div>
                        ))}
                    </div>
                ))
            ) : <div className="empty-state"><p>No resources have been uploaded yet.</p></div>}
        </div>
    );
};

interface QuizzesPageProps {
    quizzes: Quiz[];
    submissions: QuizSubmission[];
    currentUser: CurrentUser;
    setRoute: (route: Route) => void;
}
const QuizzesPage = ({ quizzes, submissions, currentUser, setRoute }: QuizzesPageProps) => {
    const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Class President';
    const userSubmissions = submissions.filter(s => s.userId === currentUser.id);

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Quizzes</h1>
                    <p className="page-subtitle">Test your knowledge and prepare for exams.</p>
                </div>
                {isAdmin && <button className="btn-primary" onClick={() => setRoute({ page: 'createQuiz' })}>+ Create Quiz</button>}
            </div>

            {quizzes.length > 0 ? (
                <div className="card-grid">
                    {quizzes.map(quiz => {
                        const submission = userSubmissions.find(s => s.quizId === quiz.id);
                        return (
                            <div className="card quiz-card" key={quiz.id}>
                                <h3>{quiz.title}</h3>
                                <p>{quiz.courseCode}</p>
                                <p style={{ flexGrow: 1 }}>{quiz.questions.length} questions</p>
                                {submission ? (
                                    <button className="btn-secondary" onClick={() => setRoute({ page: 'quizResults', submissionId: submission.id })}>
                                        View Results (Score: {submission.score}/{quiz.questions.length})
                                    </button>
                                ) : (
                                    <button className="btn-primary" onClick={() => setRoute({ page: 'takeQuiz', quizId: quiz.id })}>
                                        Take Quiz
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state"><p>No quizzes have been created yet.</p></div>
            )}
        </div>
    );
};

interface CreateQuizPageProps {
    onAddQuiz: (quiz: Omit<Quiz, 'id' | 'creatorId'>) => void;
    setRoute: (route: Route) => void;
    ALL_COURSE_CODES: string[];
}
const CreateQuizPage = ({ onAddQuiz, setRoute, ALL_COURSE_CODES }: CreateQuizPageProps) => {
    const [title, setTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [questions, setQuestions] = useState<Omit<QuizQuestion, 'id'>[]>([{ text: '', options: ['', ''], correctAnswerIndex: 0 }]);

    const handleQuestionChange = (index: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[index].text = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswerIndex = oIndex;
        setQuestions(newQuestions);
    };
    
    const addQuestion = () => setQuestions([...questions, { text: '', options: ['', ''], correctAnswerIndex: 0 }]);
    const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));

    const addOption = (qIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push('');
        setQuestions(newQuestions);
    };
    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setQuestions(newQuestions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddQuiz({ title, courseCode, questions });
        setRoute({ page: 'quizzes' });
    };

    return (
        <div>
            <a href="#" onClick={e => {e.preventDefault(); setRoute({page: 'quizzes'})}} style={{marginBottom: '2rem', display: 'inline-block'}}>&larr; Back to Quizzes</a>
            <h1 className="page-title">Create New Quiz</h1>
            <form onSubmit={handleSubmit} className="card create-quiz-form">
                <div className="form-group"><label>Quiz Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
                <div className="form-group"><label>Course Code</label>
                    <select value={courseCode} onChange={e => setCourseCode(e.target.value)} required>
                        <option value="">Select a course</option>
                        {ALL_COURSE_CODES.map(code => <option key={code} value={code}>{code}</option>)}
                    </select>
                </div>
                <hr/>
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="quiz-question-editor">
                        <h4>Question {qIndex + 1}</h4>
                        <div className="form-group"><label>Question Text</label><textarea value={q.text} onChange={e => handleQuestionChange(qIndex, e.target.value)} required></textarea></div>
                        <div className="form-group"><label>Options</label>
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="quiz-option-editor">
                                    <input type="radio" name={`correct-answer-${qIndex}`} checked={q.correctAnswerIndex === oIndex} onChange={() => handleCorrectAnswerChange(qIndex, oIndex)} />
                                    <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} required />
                                    {q.options.length > 2 && <button type="button" onClick={() => removeOption(qIndex, oIndex)}>&times;</button>}
                                </div>
                            ))}
                        </div>
                         <div className="form-actions" style={{justifyContent: 'flex-start'}}>
                             <button type="button" className="btn-tertiary btn-sm" onClick={() => addOption(qIndex)}>+ Add Option</button>
                             {questions.length > 1 && <button type="button" className="btn-danger btn-sm" onClick={() => removeQuestion(qIndex)}>Remove Question</button>}
                         </div>
                    </div>
                ))}
                <hr/>
                <div className="form-actions" style={{justifyContent: 'space-between'}}>
                    <button type="button" className="btn-secondary" onClick={addQuestion}>+ Add Question</button>
                    <button type="submit" className="btn-primary">Save Quiz</button>
                </div>
            </form>
        </div>
    );
};

interface TakeQuizPageProps {
    quiz: Quiz;
    currentUser: CurrentUser;
    onSubmit: (submission: Omit<QuizSubmission, 'id' | 'timestamp'>) => number; // returns submissionId
    setRoute: (route: Route) => void;
}
const TakeQuizPage = ({ quiz, currentUser, onSubmit, setRoute }: TakeQuizPageProps) => {
    const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null));

    const handleAnswerChange = (qIndex: number, oIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[qIndex] = oIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let score = 0;
        quiz.questions.forEach((q, i) => {
            if (q.correctAnswerIndex === answers[i]) {
                score++;
            }
        });
        const submissionId = onSubmit({ userId: currentUser.id, quizId: quiz.id, answers, score });
        setRoute({ page: 'quizResults', submissionId });
    };

    return (
        <div className="take-quiz-container">
            <h1 className="page-title">{quiz.title}</h1>
            <p className="page-subtitle">{quiz.courseCode}</p>
            <form onSubmit={handleSubmit}>
                {quiz.questions.map((q, qIndex) => (
                    <div className="card quiz-question-display" key={qIndex}>
                        <h4>Question {qIndex + 1}</h4>
                        <p>{q.text}</p>
                        <div className="quiz-options">
                            {q.options.map((opt, oIndex) => (
                                <label key={oIndex} className={`quiz-option-label ${answers[qIndex] === oIndex ? 'selected' : ''}`}>
                                    <input type="radio" name={`question-${qIndex}`} value={oIndex} onChange={() => handleAnswerChange(qIndex, oIndex)} required />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <div style={{textAlign: 'center', marginTop: '2rem'}}>
                    <button type="submit" className="btn-primary">Submit Quiz</button>
                </div>
            </form>
        </div>
    );
};

interface QuizResultsPageProps {
    quiz: Quiz;
    submission: QuizSubmission;
    setRoute: (route: Route) => void;
}
const QuizResultsPage = ({ quiz, submission, setRoute }: QuizResultsPageProps) => {
    return (
        <div className="quiz-results-container">
             <a href="#" onClick={e => {e.preventDefault(); setRoute({page: 'quizzes'})}} style={{marginBottom: '2rem', display: 'inline-block'}}>&larr; Back to Quizzes</a>
            <h1 className="page-title">Quiz Results: {quiz.title}</h1>
            <div className="card quiz-score-summary">
                <h2>Your Score: {submission.score} / {quiz.questions.length}</h2>
                <p>That's {((submission.score / quiz.questions.length) * 100).toFixed(0)}%</p>
            </div>
             {quiz.questions.map((q, qIndex) => {
                const userAnswer = submission.answers[qIndex];
                const isCorrect = q.correctAnswerIndex === userAnswer;
                return (
                    <div className={`card quiz-result-item ${isCorrect ? 'correct' : 'incorrect'}`} key={qIndex}>
                        <h4>Question {qIndex + 1}: {q.text}</h4>
                        <ul>
                        {q.options.map((opt, oIndex) => {
                            let className = '';
                            if (oIndex === q.correctAnswerIndex) className = 'correct-answer';
                            else if (oIndex === userAnswer) className = 'incorrect-answer';
                            return <li key={oIndex} className={className}>{opt}</li>;
                        })}
                        </ul>
                    </div>
                )
             })}
        </div>
    );
};


interface GradebookPageProps {
    currentUser: CurrentUser;
    customGrades: CustomGrade[];
    onAddCustomGrade: (grade: Omit<CustomGrade, 'id' | 'userId'>) => void;
    ALL_COURSE_CODES: string[];
}
const GradebookPage = ({ currentUser, customGrades, onAddCustomGrade, ALL_COURSE_CODES }: GradebookPageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ courseCode: '', itemName: '', score: '', total: '' });

    const userGrades = customGrades.filter(g => g.userId === currentUser.id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddCustomGrade({
            ...formData,
            score: parseFloat(formData.score),
            total: parseFloat(formData.total),
        });
        setIsModalOpen(false);
        setFormData({ courseCode: '', itemName: '', score: '', total: '' });
    };

    const groupedGrades = userGrades.reduce((acc, grade) => {
        (acc[grade.courseCode] = acc[grade.courseCode] || []).push(grade);
        return acc;
    }, {} as Record<string, CustomGrade[]>);

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Gradebook</h1>
                    <p className="page-subtitle">Track your scores for assignments, quizzes, and exams.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Grade</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Grade">
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Course Code</label>
                        <select value={formData.courseCode} onChange={e => setFormData({ ...formData, courseCode: e.target.value })} required>
                             <option value="">Select a course</option>
                            {ALL_COURSE_CODES.map(code => <option key={code} value={code}>{code}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label>Item Name (e.g., Midterm 1)</label><input type="text" value={formData.itemName} onChange={e => setFormData({ ...formData, itemName: e.target.value })} required /></div>
                    <div className="form-group"><label>Your Score</label><input type="number" value={formData.score} onChange={e => setFormData({ ...formData, score: e.target.value })} required /></div>
                    <div className="form-group"><label>Total Possible Score</label><input type="number" value={formData.total} onChange={e => setFormData({ ...formData, total: e.target.value })} required /></div>
                    <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-secondary">Save Grade</button>
                    </div>
                </form>
            </Modal>
            
            <div className="gradebook-grid">
            {Object.keys(groupedGrades).length > 0 ? (
                Object.entries(groupedGrades).sort(([a], [b]) => a.localeCompare(b)).map(([courseCode, grades]) => {
                    const totalScore = grades.reduce((acc, g) => acc + g.score, 0);
                    const totalPossible = grades.reduce((acc, g) => acc + g.total, 0);
                    const average = totalPossible > 0 ? ((totalScore / totalPossible) * 100).toFixed(2) : 'N/A';
                    return (
                        <div className="card course-grade-card" key={courseCode}>
                            <div className="course-grade-header">
                                <h3>{courseCode}</h3>
                                <p>Average: <strong>{average}%</strong></p>
                            </div>
                            <table className="grade-table">
                                <thead><tr><th>Item</th><th>Score</th></tr></thead>
                                <tbody>
                                    {grades.map(grade => (
                                        <tr key={grade.id}><td>{grade.itemName}</td><td>{grade.score} / {grade.total}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                })
             ) : <div className="empty-state" style={{gridColumn: '1 / -1'}}><p>No grades added yet. Click "+ Add Grade" to start.</p></div>}
             </div>
        </div>
    );
};

interface GpaCalculatorPageProps {
    currentUser: CurrentUser;
    gpaEntries: GpaEntry[];
    onAddGpaEntry: (entry: Omit<GpaEntry, 'id' | 'userId'>) => void;
}
const GpaCalculatorPage = ({ currentUser, gpaEntries, onAddGpaEntry }: GpaCalculatorPageProps) => {
    const [formData, setFormData] = useState({ courseCode: '', grade: 'A' as GpaEntry['grade'], units: '3', semester: ''});

    const gradePoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };

    const calculateGpa = (entries: GpaEntry[]) => {
        if(entries.length === 0) return '0.00';
        const totalPoints = entries.reduce((acc, entry) => acc + (gradePoints[entry.grade] * entry.units), 0);
        const totalUnits = entries.reduce((acc, entry) => acc + entry.units, 0);
        return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
    };

    const userEntries = gpaEntries.filter(e => e.userId === currentUser.id);
    const overallGpa = calculateGpa(userEntries);
    
    const semesters = [...new Set(userEntries.map(e => e.semester))].sort().reverse();

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddGpaEntry({
            ...formData,
            units: parseInt(formData.units)
        });
        setFormData({ courseCode: '', grade: 'A', units: '3', semester: ''});
    };

    return (
        <div>
            <h1 className="page-title">GPA Calculator</h1>
            <p className="page-subtitle">Track your grades to calculate semester and cumulative GPA.</p>
            <div className="gpa-calculator-grid">
                <div>
                    <div className="card gpa-results-card">
                        <h3>Your Cumulative GPA (CGPA)</h3>
                        <p>{overallGpa}</p>
                    </div>
                    <div className="card" style={{marginTop: '2rem'}}>
                        <h3>Add a New Course Grade</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group"><label>Semester (e.g., 2024 Harmattan)</label><input type="text" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required/></div>
                            <div className="form-group"><label>Course Code</label><input type="text" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value.toUpperCase()})} required/></div>
                            <div className="form-group"><label>Grade</label><select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value as GpaEntry['grade']})}><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option></select></div>
                            <div className="form-group"><label>Units</label><input type="number" min="0" value={formData.units} onChange={e => setFormData({...formData, units: e.target.value})} required/></div>
                            <button type="submit" className="btn-primary">Add Grade</button>
                        </form>
                    </div>
                </div>
                <div>
                {semesters.map(semester => {
                    const semesterEntries = userEntries.filter(e => e.semester === semester);
                    const semesterGpa = calculateGpa(semesterEntries);
                    return (
                        <div className="card" key={semester} style={{marginBottom: '2rem'}}>
                            <h3>{semester} - GPA: {semesterGpa}</h3>
                            <table className="user-table">
                                <thead><tr><th>Course</th><th>Units</th><th>Grade</th></tr></thead>
                                <tbody>
                                    {semesterEntries.map(entry => (
                                        <tr key={entry.id}><td>{entry.courseCode}</td><td>{entry.units}</td><td>{entry.grade}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                })}
                </div>
            </div>
        </div>
    );
};

interface ForumsPageProps {
    threads: ForumThread[];
    currentUser: CurrentUser;
    onAddForumThread: (data: { title: string, content: string }) => void;
    users: User[];
    setRoute: (route: Route) => void;
}
const ForumsPage = ({ threads, currentUser, onAddForumThread, users, setRoute }: ForumsPageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddForumThread(formData);
        setIsModalOpen(false);
        setFormData({ title: '', content: '' });
    };

    const getUser = (id: number) => users.find(u => u.id === id);

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Forums</h1>
                    <p className="page-subtitle">Discuss course topics and connect with classmates.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ New Thread</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start a New Discussion">
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Thread Title</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
                    <div className="form-group"><label>Your Message</label><textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required rows={5}></textarea></div>
                    <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-secondary">Post Thread</button>
                    </div>
                </form>
            </Modal>

            <div className="card">
                <table className="forum-table">
                    <thead><tr><th>Topic</th><th>Author</th><th>Replies</th><th>Last Post</th></tr></thead>
                    <tbody>
                        {threads.sort((a,b) => b.posts[b.posts.length - 1].timestamp - a.posts[a.posts.length - 1].timestamp).map(thread => {
                             const author = getUser(thread.authorId);
                             const lastPost = thread.posts[thread.posts.length-1];
                             const lastPoster = getUser(lastPost.authorId);
                             return (
                                <tr key={thread.id} onClick={() => setRoute({ page: 'viewForumThread', threadId: thread.id })}>
                                    <td><strong>{thread.title}</strong></td>
                                    <td>{author?.username || 'Unknown'}</td>
                                    <td>{thread.posts.length - 1}</td>
                                    <td>by {lastPoster?.username || 'Unknown'} <br/><small>{new Date(lastPost.timestamp).toLocaleString()}</small></td>
                                </tr>
                             )
                        })}
                    </tbody>
                </table>
                 {threads.length === 0 && <div className="empty-state"><p>No discussions yet. Be the first to start one!</p></div>}
            </div>
        </div>
    );
};

interface ViewForumThreadPageProps {
    thread: ForumThread;
    users: User[];
    currentUser: CurrentUser;
    onAddPost: (threadId: number, content: string) => void;
    setRoute: (route: Route) => void;
}
const ViewForumThreadPage = ({ thread, users, currentUser, onAddPost, setRoute }: ViewForumThreadPageProps) => {
    const [reply, setReply] = useState('');
    const getUser = (id: number) => users.find(u => u.id === id);

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (reply.trim()) {
            onAddPost(thread.id, reply);
            setReply('');
        }
    };
    
    return (
        <div>
            <a href="#" onClick={e => {e.preventDefault(); setRoute({page: 'forums'})}} style={{marginBottom: '2rem', display: 'inline-block'}}>&larr; Back to Forums</a>
            <h1 className="page-title">{thread.title}</h1>
            
            {thread.posts.map(post => {
                const author = getUser(post.authorId);
                return (
                    <div className="forum-post card" key={post.id}>
                        <div className="post-author">
                            <img src={author?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${author?.fullName}`} alt={author?.fullName}/>
                            <strong>{author?.fullName || 'Unknown'}</strong>
                            <small>{new Date(post.timestamp).toLocaleString()}</small>
                        </div>
                        <div className="post-content">
                            <p>{post.content}</p>
                        </div>
                    </div>
                )
            })}
            
            <div className="card reply-form">
                <h3>Post a Reply</h3>
                <form onSubmit={handleReply}>
                    <div className="form-group">
                        <textarea value={reply} onChange={e => setReply(e.target.value)} rows={5} required placeholder="Write your reply here..."></textarea>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Post Reply</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface PollsPageProps {
    polls: Poll[];
    currentUser: CurrentUser;
    onAddPoll: (poll: Omit<Poll, 'id' | 'createdBy'>) => void;
    onVote: (pollId: number, optionIndex: number) => void;
}
const PollsPage = ({ polls, currentUser, onAddPoll, onVote }: PollsPageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Class President';

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, '']);
    const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalOptions = options.filter(opt => opt.trim() !== '').map(opt => ({ text: opt, votes: [] }));
        if (question.trim() && finalOptions.length >= 2) {
            onAddPoll({ question, options: finalOptions });
            setIsModalOpen(false);
            setQuestion('');
            setOptions(['', '']);
        }
    };

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Polls & Surveys</h1>
                    <p className="page-subtitle">Gather feedback and opinions from the community.</p>
                </div>
                {isAdmin && <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Create Poll</button>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Poll">
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Poll Question</label><input type="text" value={question} onChange={e => setQuestion(e.target.value)} required /></div>
                    <div className="form-group"><label>Options</label>
                        {options.map((opt, index) => (
                            <div className="poll-option-editor" key={index}>
                                <input type="text" value={opt} onChange={e => handleOptionChange(index, e.target.value)} required />
                                {options.length > 2 && <button type="button" onClick={() => removeOption(index)}>&times;</button>}
                            </div>
                        ))}
                        <button type="button" className="btn-tertiary btn-sm" onClick={addOption} style={{ marginTop: '0.5rem' }}>+ Add Option</button>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-secondary">Create Poll</button>
                    </div>
                </form>
            </Modal>

            <div className="card-grid">
                {polls.map(poll => {
                    const userHasVoted = poll.options.some(opt => opt.votes.includes(currentUser.id));
                    const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);

                    return (
                        <div className="card poll-card" key={poll.id}>
                            <h4>{poll.question}</h4>
                            <div className="poll-options-container">
                                {poll.options.map((option, index) => {
                                    const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                                    return (
                                        <div key={index}>
                                            {userHasVoted ? (
                                                <div className="poll-result">
                                                    <div className="poll-result-bar" style={{ width: `${percentage}%` }}></div>
                                                    <span>{option.text} ({percentage.toFixed(0)}%)</span>
                                                </div>
                                            ) : (
                                                <button className="poll-option" onClick={() => onVote(poll.id, index)}>
                                                    {option.text}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <small className="total-votes">{totalVotes} vote(s)</small>
                        </div>
                    );
                })}
            </div>
            {polls.length === 0 && <div className="empty-state"><p>No polls have been created yet.</p></div>}
        </div>
    );
};


interface CalendarPageProps {
    events: CalendarEvent[];
    currentUser: CurrentUser;
    onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}
const CalendarPage = ({ events, currentUser, onAddEvent }: CalendarPageProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', date: '', type: 'academic' as CalendarEvent['type'] });
    const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Class President';

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const calendarDays = [];
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(<div className="calendar-day empty" key={`empty-${i}`}></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        calendarDays.push(
            <div className="calendar-day" key={day}>
                <span>{day}</span>
                <div className="events-container">
                    {dayEvents.map(e => <div key={e.id} className={`calendar-event ${e.type}`} title={e.title}></div>)}
                </div>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddEvent(formData);
        setIsModalOpen(false);
        setFormData({ title: '', date: '', type: 'academic' });
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Academic Calendar</h1>
                    <p className="page-subtitle">Keep track of important dates, deadlines, and events.</p>
                </div>
                {isAdmin && <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Event</button>}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Calendar Event">
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Event Title</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
                    <div className="form-group"><label>Date</label><input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required /></div>
                    <div className="form-group"><label>Event Type</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}>
                            <option value="academic">Academic</option>
                            <option value="social">Social</option>
                            <option value="deadline">Deadline</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-secondary">Add Event</button>
                    </div>
                </form>
            </Modal>
            
            <div className="card">
                <div className="calendar-header">
                    <button onClick={() => changeMonth(-1)}>&larr;</button>
                    <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={() => changeMonth(1)}>&rarr;</button>
                </div>
                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div className="calendar-day-name" key={day}>{day}</div>)}
                    {calendarDays}
                </div>
            </div>
        </div>
    );
};


interface MessagesPageProps {
    currentUser: CurrentUser;
    users: User[];
    messages: Message[];
    onSendMessage: (to: number, text: string) => void;
    route: Route;
    setRoute: (route: Route) => void;
}
const MessagesPage = ({ currentUser, users, messages, onSendMessage, route, setRoute }: MessagesPageProps) => {
    const activeConversationUserId = route.with;
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState('');

    const conversations = [...new Set(
        messages
            .filter(m => m.from === currentUser.id || m.to === currentUser.id)
            .flatMap(m => [m.from, m.to])
    )].filter(id => id !== currentUser.id);

    const activeChatMessages = messages
        .filter(m => (m.from === currentUser.id && m.to === activeConversationUserId) || (m.from === activeConversationUserId && m.to === currentUser.id))
        .sort((a, b) => a.timestamp - b.timestamp);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChatMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && activeConversationUserId) {
            onSendMessage(activeConversationUserId, newMessage.trim());
            setNewMessage('');
        }
    };
    
    const getUser = (id: number) => users.find(u => u.id === id);

    return (
        <div className="messages-layout">
            <div className="conversations-list card">
                <h3>Conversations</h3>
                {conversations.map(userId => {
                    const user = getUser(userId);
                    if (!user) return null;
                    const lastMessage = [...messages].filter(m => m.from === userId || m.to === userId).pop();
                    return (
                        <div key={userId} className={`conversation-item ${activeConversationUserId === userId ? 'active' : ''}`} onClick={() => setRoute({ page: 'messages', with: userId })}>
                             <img src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} alt={user.fullName} />
                            <div>
                                <strong>{user.fullName}</strong>
                                <p>{lastMessage?.text.substring(0, 25)}...</p>
                            </div>
                        </div>
                    )
                })}
                 {conversations.length === 0 && <p>No conversations yet.</p>}
            </div>
            <div className="chat-window card">
                {activeConversationUserId ? (
                    <>
                        <div className="chat-header">
                            <h4>{getUser(activeConversationUserId)?.fullName || 'Select a conversation'}</h4>
                        </div>
                        <div className="message-area">
                            {activeChatMessages.map(msg => (
                                <div key={msg.id} className={`message-bubble ${msg.from === currentUser.id ? 'sent' : 'received'}`}>
                                    <p>{msg.text}</p>
                                    <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="message-input-form">
                            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message..." />
                            <button type="submit" className="btn-primary">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="empty-state">
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface TutoringMarketplacePageProps {
    currentUser: CurrentUser;
    users: User[];
    tutorProfiles: TutorProfile[];
    onRegisterTutor: (profile: Omit<TutorProfile, 'userId'>) => void;
}
const TutoringMarketplacePage = ({ currentUser, users, tutorProfiles, onRegisterTutor }: TutoringMarketplacePageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const existingProfile = tutorProfiles.find(p => p.userId === currentUser.id);
    const [formData, setFormData] = useState({
        subjects: existingProfile?.subjects.join(', ') || '',
        rate: existingProfile?.rate || '',
        availability: existingProfile?.availability || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRegisterTutor({
            ...formData,
            subjects: formData.subjects.split(',').map(s => s.trim()),
        });
        setIsModalOpen(false);
    };

    const getUser = (userId: number) => users.find(u => u.id === userId);

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Tutoring Marketplace</h1>
                    <p className="page-subtitle">Find peer tutors or offer your own services.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    {existingProfile ? 'Update Your Profile' : 'Become a Tutor'}
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={existingProfile ? 'Update Tutor Profile' : 'Tutor Registration'}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Subjects (comma-separated)</label><input type="text" value={formData.subjects} onChange={e => setFormData({ ...formData, subjects: e.target.value })} required /></div>
                    <div className="form-group"><label>Rate (e.g., ₦2000/hr)</label><input type="text" value={formData.rate} onChange={e => setFormData({ ...formData, rate: e.target.value })} required /></div>
                    <div className="form-group"><label>Availability</label><textarea value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })} required /></div>
                    <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-secondary">Save Profile</button>
                    </div>
                </form>
            </Modal>

            <div className="directory-grid">
                {tutorProfiles.map(profile => {
                    const tutor = getUser(profile.userId);
                    if (!tutor) return null;
                    return (
                        <div className="card tutor-card" key={profile.userId}>
                            <img src={tutor.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${tutor.fullName}`} alt={tutor.fullName} />
                            <h4>{tutor.fullName}</h4>
                            <p><strong>Subjects:</strong> {profile.subjects.join(', ')}</p>
                            <p><strong>Rate:</strong> {profile.rate}</p>
                            <p><strong>Availability:</strong> {profile.availability}</p>
                        </div>
                    );
                })}
            </div>
             {tutorProfiles.length === 0 && <div className="empty-state"><p>No tutors have registered yet. Be the first!</p></div>}
        </div>
    );
};

interface PublicNotesPageProps {
    currentUser: CurrentUser;
    publicNotes: PublicNote[];
    onAddPublicNote: (note: Omit<PublicNote, 'id' | 'authorId'>) => void;
    users: User[];
}
const PublicNotesPage = ({ currentUser, publicNotes, onAddPublicNote, users }: PublicNotesPageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!file || !title) {
            setError('Title and file are required.');
            return;
        }
        try {
            const base64Data = await getFileAsBase64(file);
            onAddPublicNote({
                title,
                name: file.name,
                type: file.type,
                data: base64Data
            });
            setTitle('');
            setFile(null);
            setIsModalOpen(false);
        } catch (err) {
            setError('Failed to upload file.');
        }
    };
    
    const getAuthorName = (authorId: number) => users.find(u => u.id === authorId)?.fullName || 'Unknown';

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Public Notes</h1>
                    <p className="page-subtitle">Share helpful documents with the entire community.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Upload Note</button>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Public Note">
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group"><label>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
                    <div className="form-group"><label>File</label><input type="file" onChange={handleFileChange} required /></div>
                     <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-secondary">Upload</button>
                    </div>
                </form>
            </Modal>
            
            <div className="card">
            {publicNotes.length > 0 ? (
                publicNotes.map(note => (
                     <div className="resource-item" key={note.id}>
                        <div>
                            <strong>{note.title}</strong>
                            <p style={{fontSize: '0.9rem', color: '#6B7280'}}>by {getAuthorName(note.authorId)} - {note.name}</p>
                        </div>
                        <a href={note.data} download={note.name} className="btn-primary btn-sm">Download</a>
                    </div>
                ))
            ) : <div className="empty-state"><p>No public notes have been shared yet.</p></div>}
            </div>
        </div>
    );
};

// --- REMAINDER OF PAGE COMPONENTS (Jobs, Lost/Found, etc.) ---

interface JobBoardPageProps {
    jobs: Job[];
    currentUser: CurrentUser;
    onAddJob: (job: Omit<Job, 'id' | 'postedById'>) => void;
}
const JobBoardPage = ({ jobs, currentUser, onAddJob }: JobBoardPageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Omit<Job, 'id' | 'postedById'>>({ title: '', company: '', location: '', type: 'Internship', description: '', link: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddJob(formData);
        setIsModalOpen(false);
        setFormData({ title: '', company: '', location: '', type: 'Internship', description: '', link: '' });
    };

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Job & Internship Board</h1>
                    <p className="page-subtitle">Find opportunities relevant to your field of study.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Post Opportunity</button>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post New Job/Internship">
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Job Title</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
                    <div className="form-group"><label>Company</label><input type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} required /></div>
                    <div className="form-group"><label>Location</label><input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required /></div>
                    <div className="form-group"><label>Job Type</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as Job['type'] })}>
                            <option value="Internship">Internship</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                        </select>
                    </div>
                    <div className="form-group"><label>Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea></div>
                    <div className="form-group"><label>Application Link</label><input type="url" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} required /></div>
                     <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-secondary">Post</button>
                    </div>
                </form>
            </Modal>
            
            {jobs.length > 0 ? (
                <div className="card-grid">
                {jobs.map(job => (
                    <div className="card job-card" key={job.id}>
                        <span className={`job-type-badge ${job.type}`}>{job.type}</span>
                        <h3>{job.title}</h3>
                        <p className="job-company">{job.company}</p>
                        <p className="job-location">{job.location}</p>
                        <p style={{flexGrow: 1, marginTop: '1rem'}}>{job.description}</p>
                        <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn-primary">Apply Now</a>
                    </div>
                ))}
                </div>
            ) : <div className="empty-state"><p>No job opportunities have been posted yet.</p></div>}
        </div>
    );
};

interface LostAndFoundPageProps {
    items: LostFoundItem[];
    currentUser: CurrentUser;
    onAddItem: (item: Omit<LostFoundItem, 'id' | 'postedById' | 'timestamp'>) => void;
    users: User[];
}
const LostAndFoundPage = ({ items, currentUser, onAddItem, users }: LostAndFoundPageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ type: 'lost' as 'lost' | 'found', itemName: '', description: '', location: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddItem(formData);
        setIsModalOpen(false);
        setFormData({ type: 'lost', itemName: '', description: '', location: '' });
    };

    const lostItems = items.filter(i => i.type === 'lost').sort((a,b) => b.timestamp - a.timestamp);
    const foundItems = items.filter(i => i.type === 'found').sort((a,b) => b.timestamp - a.timestamp);

    const getPosterName = (id: number) => users.find(u => u.id === id)?.fullName || 'Unknown';

    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Lost & Found</h1>
                    <p className="page-subtitle">Post items you've lost or found on campus.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Post an Item</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post a Lost or Found Item">
                 <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Item Status</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as 'lost' | 'found' })}>
                            <option value="lost">I Lost Something</option>
                            <option value="found">I Found Something</option>
                        </select>
                    </div>
                    <div className="form-group"><label>Item Name</label><input type="text" value={formData.itemName} onChange={e => setFormData({ ...formData, itemName: e.target.value })} required /></div>
                    <div className="form-group"><label>Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required /></div>
                    <div className="form-group"><label>Last Seen / Found At</label><input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required /></div>
                     <div className="form-actions">
                        <button type="button" className="btn-tertiary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-secondary">Post</button>
                    </div>
                 </form>
            </Modal>
            
            <div className="lost-found-grid">
                <div className="card">
                    <h2>Lost Items</h2>
                    {lostItems.length > 0 ? lostItems.map(item => (
                        <div className="lost-found-item" key={item.id}>
                            <h4>{item.itemName}</h4>
                            <p>{item.description}</p>
                            <p><strong>Last Seen:</strong> {item.location}</p>
                            <small>Posted by {getPosterName(item.postedById)} on {new Date(item.timestamp).toLocaleDateString()}</small>
                        </div>
                    )) : <p>No lost items reported.</p>}
                </div>
                <div className="card">
                    <h2>Found Items</h2>
                    {foundItems.length > 0 ? foundItems.map(item => (
                        <div className="lost-found-item" key={item.id}>
                            <h4>{item.itemName}</h4>
                            <p>{item.description}</p>
                            <p><strong>Found At:</strong> {item.location}</p>
                            <small>Posted by {getPosterName(item.postedById)} on {new Date(item.timestamp).toLocaleDateString()}</small>
                        </div>
                    )) : <p>No found items reported.</p>}
                </div>
            </div>
        </div>
    );
};

// ... a lot more code for all the other pages ...
// For brevity, let's assume Members Directory, Flashcards, Profile, and Admin pages are here.

interface FlashcardsPageProps {
    flashcardSets: FlashcardSet[];
    currentUser: CurrentUser;
    setRoute: (route: Route) => void;
}
const FlashcardsPage = ({ flashcardSets, currentUser, setRoute }: FlashcardsPageProps) => {
    return (
        <div>
            <div className="page-header-with-action">
                <div>
                    <h1 className="page-title">Flashcards</h1>
                    <p className="page-subtitle">Create and review flashcard sets for your courses.</p>
                </div>
                <button className="btn-primary" onClick={() => setRoute({ page: 'createFlashcardSet' })}>+ Create New Set</button>
            </div>
            {flashcardSets.length > 0 ? (
                <div className="card-grid">
                    {flashcardSets.map(set => (
                        <div className="card" key={set.id}>
                            <h3>{set.title}</h3>
                            <p>{set.courseCode}</p>
                            <p style={{flexGrow: 1}}>{set.cards.length} cards</p>
                            <button className="btn-primary" onClick={() => setRoute({ page: 'viewFlashcardSet', setId: set.id })}>
                                Study
                            </button>
                        </div>
                    ))}
                </div>
            ) : <div className="empty-state"><p>No flashcard sets created yet.</p></div>}
        </div>
    );
};

interface CreateFlashcardSetPageProps {
    onAddSet: (set: { title: string, courseCode: string, cards: Omit<Flashcard, 'id'>[] }) => void;
    setRoute: (route: Route) => void;
    ALL_COURSE_CODES: string[];
}
const CreateFlashcardSetPage = ({ onAddSet, setRoute, ALL_COURSE_CODES }: CreateFlashcardSetPageProps) => {
    const [title, setTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [cards, setCards] = useState<Omit<Flashcard, 'id'>[]>([{ front: '', back: '' }]);
    
    const handleCardChange = (index: number, side: 'front' | 'back', value: string) => {
        const newCards = [...cards];
        newCards[index][side] = value;
        setCards(newCards);
    };

    const addCard = () => setCards([...cards, { front: '', back: '' }]);
    const removeCard = (index: number) => setCards(cards.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddSet({ title, courseCode, cards });
        setRoute({ page: 'flashcards' });
    };

    return (
        <div>
             <a href="#" onClick={e => {e.preventDefault(); setRoute({page: 'flashcards'})}} style={{marginBottom: '2rem', display: 'inline-block'}}>&larr; Back to Flashcards</a>
            <h1 className="page-title">Create Flashcard Set</h1>
            <form onSubmit={handleSubmit} className="card">
                <div className="form-group"><label>Set Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
                <div className="form-group"><label>Course Code</label>
                    <select value={courseCode} onChange={e => setCourseCode(e.target.value)} required>
                        <option value="">Select a course</option>
                        {ALL_COURSE_CODES.map(code => <option key={code} value={code}>{code}</option>)}
                    </select>
                </div>
                <hr />
                <h3>Cards</h3>
                {cards.map((card, index) => (
                    <div className="flashcard-editor-item" key={index}>
                        <span>{index + 1}</span>
                        <textarea placeholder="Front" value={card.front} onChange={e => handleCardChange(index, 'front', e.target.value)} required />
                        <textarea placeholder="Back" value={card.back} onChange={e => handleCardChange(index, 'back', e.target.value)} required />
                        <button type="button" className="btn-danger btn-sm" onClick={() => removeCard(index)}>&times;</button>
                    </div>
                ))}
                 <div className="form-actions" style={{justifyContent: 'flex-start'}}>
                    <button type="button" className="btn-tertiary" onClick={addCard}>+ Add Card</button>
                 </div>
                 <hr/>
                 <div className="form-actions">
                     <button type="submit" className="btn-primary">Save Set</button>
                 </div>
            </form>
        </div>
    );
};

interface ViewFlashcardSetPageProps {
    set: FlashcardSet;
    setRoute: (route: Route) => void;
}
const ViewFlashcardSetPage = ({ set, setRoute }: ViewFlashcardSetPageProps) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentCardIndex(prev => (prev + 1) % set.cards.length);
    };
    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentCardIndex(prev => (prev - 1 + set.cards.length) % set.cards.length);
    };

    const currentCard = set.cards[currentCardIndex];

    return (
        <div>
            <a href="#" onClick={e => {e.preventDefault(); setRoute({page: 'flashcards'})}} style={{marginBottom: '2rem', display: 'inline-block'}}>&larr; Back to Flashcards</a>
            <h1 className="page-title">{set.title}</h1>
            
            <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                <div className="flashcard-inner">
                    <div className="flashcard-front">{currentCard.front}</div>
                    <div className="flashcard-back">{currentCard.back}</div>
                </div>
            </div>

            <div className="flashcard-nav">
                <button className="btn-secondary" onClick={handlePrev}>&larr; Prev</button>
                <span>Card {currentCardIndex + 1} of {set.cards.length}</span>
                <button className="btn-secondary" onClick={handleNext}>Next &rarr;</button>
            </div>
        </div>
    );
};


interface ProfilePageProps {
    currentUser: CurrentUser;
    onUpdateUser: (updatedUser: Partial<User>) => void;
}
const ProfilePage = ({ currentUser, onUpdateUser }: ProfilePageProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: currentUser.firstName,
        otherName: currentUser.otherName,
        surname: currentUser.surname,
        username: currentUser.username,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onUpdateUser(formData);
        setIsEditing(false);
    };
    
    const handleProfilePicClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const base64 = await getFileAsBase64(file);
                onUpdateUser({ profilePicture: base64 });
            } catch (error) {
                console.error("Error converting file to base64", error);
                alert("Failed to upload image. Please try again.");
            }
        }
    };


    return (
        <div>
            <h1 className="page-title">My Profile</h1>
            <div className="profile-grid">
                <div className="card profile-card">
                     <div className="profile-picture-container" onClick={handleProfilePicClick} title="Change Profile Picture">
                        <img className="profile-page-avatar" src={currentUser.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`} alt="Profile Avatar" />
                        <div className="profile-picture-edit-overlay">
                            <span>Change<br/>Photo</span>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                    </div>
                    <h2>{currentUser.fullName}</h2>
                    <p>{currentUser.role}</p>
                </div>
                <div className="card">
                    <h3>Personal Information</h3>
                    {isEditing ? (
                        <>
                            <div className="form-group"><label>First Name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} /></div>
                            <div className="form-group"><label>Other Name</label><input type="text" name="otherName" value={formData.otherName} onChange={handleChange} /></div>
                            <div className="form-group"><label>Surname</label><input type="text" name="surname" value={formData.surname} onChange={handleChange} /></div>
                            <div className="form-group"><label>Username</label><input type="text" name="username" value={formData.username} onChange={handleChange} /></div>
                            <div className="form-actions">
                                <button className="btn-tertiary" onClick={() => setIsEditing(false)}>Cancel</button>
                                <button className="btn-primary" onClick={handleSave}>Save</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <dl className="profile-info">
                                <dt>Full Name</dt><dd>{currentUser.fullName}</dd>
                                <dt>Username</dt><dd>{currentUser.username}</dd>
                                <dt>Email</dt><dd>{currentUser.email}</dd>
                                <dt>Matric Number</dt><dd>{currentUser.matricNumber}</dd>
                            </dl>
                            <div className="form-actions">
                                <button className="btn-secondary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

interface MembersPageProps {
    users: User[];
    setRoute: (route: Route) => void;
}
const MembersPage = ({ users, setRoute }: MembersPageProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredUsers = users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <h1 className="page-title">Members Directory</h1>
            <p className="page-subtitle">Connect with your fellow classmates.</p>
            <div className="admin-toolbar">
                <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="directory-grid">
                {filteredUsers.map(user => (
                    <div className="card member-card" key={user.id}>
                        <img src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} alt={user.fullName} />
                        <h4>{user.fullName}</h4>
                        <p>{user.matricNumber}</p>
                        <button className="btn-primary btn-sm" onClick={() => setRoute({ page: 'messages', with: user.id })}>
                            Send Message
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface AdminPanelPageProps {
    users: User[];
    onUpdateUserStatus: (userId: number, status: User['status']) => void;
    onUpdateUserRole: (userId: number, role: User['role']) => void;
    approvedMatricNumbers: string[];
    onAddMatricNumber: (matric: string) => void;
    onRemoveMatricNumber: (matric: string) => void;
    coursesData: CoursesData;
    onAddCourse: (level: string, semester: string, course: Omit<Course, 'id'>) => void;
    onUpdateCourse: (level: string, semester: string, course: Course) => void;
    onDeleteCourse: (level: string, semester: string, courseId: number) => void;
    announcements: Announcement[];
    onUpdateAnnouncement: (announcement: Announcement) => void;
    onDeleteAnnouncement: (announcementId: number) => void;
    assignments: Assignment[];
    onUpdateAssignment: (assignment: Assignment) => void;
    onDeleteAssignment: (assignmentId: number) => void;
    faculty: Faculty[];
    onAddFaculty: (faculty: Omit<Faculty, 'id'>) => void;
    onUpdateFaculty: (faculty: Faculty) => void;
    onDeleteFaculty: (facultyId: number) => void;
    quizzes: Quiz[];
    onDeleteQuiz: (quizId: number) => void;
    polls: Poll[];
    onDeletePoll: (pollId: number) => void;
    systemSettings: { maintenanceMode: boolean };
    onUpdateSystemSettings: (settings: { maintenanceMode: boolean }) => void;
}
const AdminPanelPage = (props: AdminPanelPageProps) => {
    const { users, onUpdateUserStatus, onUpdateUserRole, approvedMatricNumbers, onAddMatricNumber, onRemoveMatricNumber, coursesData, onAddCourse, onUpdateCourse, onDeleteCourse, announcements, onUpdateAnnouncement, onDeleteAnnouncement, assignments, onUpdateAssignment, onDeleteAssignment, faculty, onAddFaculty, onUpdateFaculty, onDeleteFaculty, quizzes, onDeleteQuiz, polls, onDeletePoll, systemSettings, onUpdateSystemSettings } = props;
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [newMatric, setNewMatric] = useState('');
    
    // Modal state for editing items
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const restoreInputRef = useRef<HTMLInputElement>(null);


    const filteredUsers = users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const handleAddMatric = () => {
        if(newMatric.trim() && !approvedMatricNumbers.includes(newMatric.trim().toUpperCase())) {
            onAddMatricNumber(newMatric.trim().toUpperCase());
            setNewMatric('');
        }
    };
    
    const openModal = (type: string, item: any) => {
        setModalType(type);
        setEditingItem(item);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setModalType('');
    };
    
    const renderDashboard = () => (
        <>
            <h3>Dashboard</h3>
            <div className="admin-dashboard-grid">
                <div className="dashboard-card"><h4>Total Users</h4><p>{users.length}</p></div>
                <div className="dashboard-card"><h4>Announcements</h4><p>{announcements.length}</p></div>
                <div className="dashboard-card"><h4>Assignments</h4><p>{assignments.length}</p></div>
                <div className="dashboard-card"><h4>Quizzes</h4><p>{quizzes.length}</p></div>
            </div>
        </>
    );

    const renderUserManagement = () => (
        <>
            <h3>User Management</h3>
            <div className="admin-toolbar">
                <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="table-container card">
                <table className="user-table">
                    <thead><tr><th>Name</th><th>Matric No.</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.fullName}</td><td>{user.matricNumber}</td>
                                <td>
                                    <select value={user.role} onChange={e => onUpdateUserRole(user.id, e.target.value)}>
                                        <option>Student</option><option>Class President</option><option>Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <select value={user.status} onChange={e => onUpdateUserStatus(user.id, e.target.value as User['status'])}>
                                        <option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option>
                                    </select>
                                </td>
                                <td className="actions">
                                    <button className="btn-secondary btn-sm" onClick={() => openModal('viewUser', user)}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderMatricManagement = () => (
        <>
            <h3>Matriculation Management</h3>
            <div className="card">
                <h4>Add New Matriculation Number</h4>
                <div className="admin-toolbar">
                    <input type="text" placeholder="e.g., 2024012345" value={newMatric} onChange={e => setNewMatric(e.target.value)} />
                    <button className="btn-primary" onClick={handleAddMatric}>Add Number</button>
                </div>
            </div>
             <div className="card" style={{marginTop: '2rem'}}>
                 <h4>Approved List</h4>
                 <ul>
                    {approvedMatricNumbers.map(m => <li key={m}>{m} <button onClick={() => onRemoveMatricNumber(m)}>&times;</button></li>)}
                 </ul>
             </div>
        </>
    );

    const renderCourseManagement = () => (
        <>
            <h3>Course Management</h3>
            <div className="card">
                {Object.entries(coursesData).map(([level, semesters]) => (
                    <details key={level} className="admin-course-level">
                        <summary>{level}</summary>
                        {Object.entries(semesters).map(([semester, courses]) => (
                            <div key={semester}>
                                <h4>{semester}</h4>
                                <table className="user-table">
                                    <thead><tr><th>Code</th><th>Title</th><th>Units</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {courses.map(course => (
                                            <tr key={course.id}>
                                                <td>{course.code}</td><td>{course.title}</td><td>{course.units}</td>
                                                <td className="admin-table-actions">
                                                    <button className="btn-secondary btn-sm" onClick={() => openModal('course', { ...course, level, semester })}>Edit</button>
                                                    <button className="btn-danger btn-sm" onClick={() => onDeleteCourse(level, semester, course.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </details>
                ))}
            </div>
        </>
    );
    
    const renderFacultyManagement = () => (
        <>
            <h3>Faculty Management</h3>
            <div className="admin-toolbar">
                <button className="btn-primary" onClick={() => openModal('faculty', { name: '', title: '', email: '', office: '', courses: [], profilePicture: `https://api.dicebear.com/7.x/adventurer/svg?seed=new` })} >+ Add Faculty Member</button>
            </div>
            <div className="table-container card">
                <table className="user-table">
                    <thead><tr><th>Name</th><th>Title</th><th>Email</th><th>Actions</th></tr></thead>
                    <tbody>
                        {faculty.map(member => (
                            <tr key={member.id}>
                                <td>{member.name}</td><td>{member.title}</td><td>{member.email}</td>
                                <td className="admin-table-actions">
                                    <button className="btn-secondary btn-sm" onClick={() => openModal('faculty', member)}>Edit</button>
                                    <button className="btn-danger btn-sm" onClick={() => onDeleteFaculty(member.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderAnnouncementManagement = () => (
        <>
            <h3>Announcement Management</h3>
             <div className="table-container card">
                 <table className="user-table">
                    <thead><tr><th>Title</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                        {announcements.map(item => (
                            <tr key={item.id}>
                                <td>{item.title}</td><td>{item.date}</td>
                                <td className="admin-table-actions">
                                    <button className="btn-secondary btn-sm" onClick={() => openModal('announcement', item)}>Edit</button>
                                    <button className="btn-danger btn-sm" onClick={() => onDeleteAnnouncement(item.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
        </>
    );

    const renderAssignmentManagement = () => (
        <>
            <h3>Assignment Management</h3>
             <div className="table-container card">
                 <table className="user-table">
                    <thead><tr><th>Title</th><th>Course</th><th>Due Date</th><th>Actions</th></tr></thead>
                    <tbody>
                        {assignments.map(item => (
                            <tr key={item.id}>
                                <td>{item.title}</td><td>{item.courseCode}</td><td>{item.dueDate}</td>
                                <td className="admin-table-actions">
                                    <button className="btn-secondary btn-sm" onClick={() => openModal('assignment', item)}>Edit</button>
                                    <button className="btn-danger btn-sm" onClick={() => onDeleteAssignment(item.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
        </>
    );

    const renderQuizManagement = () => (
        <>
            <h3>Quiz Management</h3>
            <div className="table-container card">
                <table className="user-table">
                    <thead><tr><th>Title</th><th>Course</th><th>Questions</th><th>Actions</th></tr></thead>
                    <tbody>
                        {quizzes.map(quiz => (
                            <tr key={quiz.id}>
                                <td>{quiz.title}</td><td>{quiz.courseCode}</td><td>{quiz.questions.length}</td>
                                <td className="admin-table-actions">
                                    <button className="btn-danger btn-sm" onClick={() => onDeleteQuiz(quiz.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderPollManagement = () => (
        <>
            <h3>Poll Management</h3>
            <div className="table-container card">
                <table className="user-table">
                    <thead><tr><th>Question</th><th>Options</th><th>Total Votes</th><th>Actions</th></tr></thead>
                    <tbody>
                        {polls.map(poll => (
                            <tr key={poll.id}>
                                <td>{poll.question}</td>
                                <td>{poll.options.length}</td>
                                <td>{poll.options.reduce((acc, opt) => acc + opt.votes.length, 0)}</td>
                                <td className="admin-table-actions">
                                    <button className="btn-danger btn-sm" onClick={() => onDeletePoll(poll.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderSettingsManagement = () => {
        const backupData = () => {
            const allData: { [key: string]: string | null } = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    allData[key] = localStorage.getItem(key);
                }
            }
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `portal-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    
        const handleRestoreClick = () => {
            restoreInputRef.current?.click();
        };
    
        const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;
    
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text !== 'string') throw new Error("File could not be read");
                    const data = JSON.parse(text);
                    if (window.confirm("Are you sure you want to restore? This will overwrite all current data.")) {
                        localStorage.clear();
                        Object.keys(data).forEach(key => {
                            localStorage.setItem(key, data[key]);
                        });
                        alert("Restore successful! The application will now reload.");
                        window.location.reload();
                    }
                } catch (error) {
                    alert("Error parsing backup file. Please make sure it's a valid JSON file from this application.");
                    console.error("Restore error:", error);
                }
            };
            reader.readAsText(file);
        };
    
        return (
            <>
                <h3>System Settings</h3>
                <div className="card">
                    <h4>Maintenance Mode</h4>
                    <p>When enabled, only admins can access the portal. Other users will see a maintenance page.</p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                            type="checkbox" 
                            checked={systemSettings.maintenanceMode} 
                            onChange={e => onUpdateSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })} 
                        />
                        Enable Maintenance Mode
                    </label>
                </div>
                <div className="card" style={{marginTop: '2rem'}}>
                    <h4>Data Management</h4>
                    <p>Backup all portal data to a JSON file, or restore from a backup file. Restoring will overwrite all existing data.</p>
                    <div className="form-actions" style={{justifyContent: 'flex-start'}}>
                        <button className="btn-secondary" onClick={backupData}>Backup Data</button>
                        <button className="btn-tertiary" onClick={handleRestoreClick}>Restore Data</button>
                        <input type="file" ref={restoreInputRef} onChange={handleRestore} style={{display: 'none'}} accept=".json" />
                    </div>
                </div>
            </>
        );
    };

    const renderModal = () => {
        if (!isModalOpen || !editingItem) return null;
        
        const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setEditingItem({ ...editingItem, [e.target.name]: e.target.value });
        };
        
        switch (modalType) {
            case 'viewUser':
                return (
                    <Modal isOpen={isModalOpen} onClose={closeModal} title={`User Profile: ${editingItem.fullName}`}>
                        <dl className="profile-info">
                            <dt>Full Name</dt><dd>{editingItem.fullName}</dd>
                            <dt>Username</dt><dd>{editingItem.username}</dd>
                            <dt>Email</dt><dd>{editingItem.email}</dd>
                            <dt>Matric Number</dt><dd>{editingItem.matricNumber}</dd>
                            <dt>Role</dt><dd>{editingItem.role}</dd>
                            <dt>Status</dt><dd>{editingItem.status}</dd>
                        </dl>
                    </Modal>
                );
            case 'course':
                return (
                    <Modal isOpen={isModalOpen} onClose={closeModal} title={`Edit Course: ${editingItem.code}`}>
                        <form onSubmit={e => { e.preventDefault(); onUpdateCourse(editingItem.level, editingItem.semester, editingItem); closeModal(); }}>
                            <div className="form-group"><label>Code</label><input type="text" name="code" value={editingItem.code} onChange={handleItemChange} /></div>
                            <div className="form-group"><label>Title</label><input type="text" name="title" value={editingItem.title} onChange={handleItemChange} /></div>
                            <div className="form-group"><label>Units</label><input type="text" name="units" value={editingItem.units} onChange={handleItemChange} /></div>
                            <div className="form-actions"><button type="submit" className="btn-primary">Save Changes</button></div>
                        </form>
                    </Modal>
                );
            case 'announcement':
                 return (
                    <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit Announcement">
                        <form onSubmit={e => { e.preventDefault(); onUpdateAnnouncement(editingItem); closeModal(); }}>
                            <div className="form-group"><label>Title</label><input type="text" name="title" value={editingItem.title} onChange={handleItemChange} /></div>
                            <div className="form-group"><label>Content</label><textarea name="content" value={editingItem.content} onChange={handleItemChange} rows={5}/></div>
                            <div className="form-actions"><button type="submit" className="btn-primary">Save Changes</button></div>
                        </form>
                    </Modal>
                );
            case 'assignment':
                 return (
                    <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit Assignment">
                        <form onSubmit={e => { e.preventDefault(); onUpdateAssignment(editingItem); closeModal(); }}>
                            <div className="form-group"><label>Title</label><input type="text" name="title" value={editingItem.title} onChange={handleItemChange} /></div>
                            <div className="form-group"><label>Description</label><textarea name="description" value={editingItem.description} onChange={handleItemChange} rows={5}/></div>
                            <div className="form-group"><label>Due Date</label><input type="date" name="dueDate" value={editingItem.dueDate} onChange={handleItemChange} /></div>
                            <div className="form-actions"><button type="submit" className="btn-primary">Save Changes</button></div>
                        </form>
                    </Modal>
                );
            case 'faculty': {
                const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files[0]) {
                        const base64 = await getFileAsBase64(e.target.files[0]);
                        setEditingItem({ ...editingItem, profilePicture: base64 });
                    }
                };

                const handleSubmit = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (editingItem.id) {
                        onUpdateFaculty(editingItem);
                    } else {
                        onAddFaculty(editingItem);
                    }
                    closeModal();
                };

                return (
                    <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem.id ? `Edit Faculty: ${editingItem.name}` : 'Add New Faculty Member'}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Profile Picture</label>
                                <img src={editingItem.profilePicture} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', display: 'block' }} />
                                <input type="file" onChange={handleFileChange} accept="image/*" />
                            </div>
                            <div className="form-group"><label>Full Name</label><input type="text" name="name" value={editingItem.name} onChange={handleItemChange} required /></div>
                            <div className="form-group"><label>Title</label><input type="text" name="title" value={editingItem.title} onChange={handleItemChange} required /></div>
                            <div className="form-group"><label>Email</label><input type="email" name="email" value={editingItem.email} onChange={handleItemChange} required /></div>
                            <div className="form-group"><label>Office</label><input type="text" name="office" value={editingItem.office} onChange={handleItemChange} required /></div>
                            <div className="form-group">
                                <label>Courses (comma-separated)</label>
                                <input 
                                    type="text" 
                                    name="courses" 
                                    value={Array.isArray(editingItem.courses) ? editingItem.courses.join(', ') : editingItem.courses || ''} 
                                    onChange={handleItemChange} 
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-tertiary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </Modal>
                );
            }
            default: return null;
        }
    };


    return (
        <div>
            <h1 className="page-title">Admin Panel</h1>
            <div className="admin-tabs">
                <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
                <button className={activeTab === 'matric' ? 'active' : ''} onClick={() => setActiveTab('matric')}>Matric Numbers</button>
                <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>Courses</button>
                <button className={activeTab === 'faculty' ? 'active' : ''} onClick={() => setActiveTab('faculty')}>Faculty</button>
                <button className={activeTab === 'announcements' ? 'active' : ''} onClick={() => setActiveTab('announcements')}>Announcements</button>
                <button className={activeTab === 'assignments' ? 'active' : ''} onClick={() => setActiveTab('assignments')}>Assignments</button>
                <button className={activeTab === 'quizzes' ? 'active' : ''} onClick={() => setActiveTab('quizzes')}>Quizzes</button>
                <button className={activeTab === 'polls' ? 'active' : ''} onClick={() => setActiveTab('polls')}>Polls</button>
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Settings</button>
            </div>
            <div className="admin-section">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'users' && renderUserManagement()}
                {activeTab === 'matric' && renderMatricManagement()}
                {activeTab === 'courses' && renderCourseManagement()}
                {activeTab === 'faculty' && renderFacultyManagement()}
                {activeTab === 'announcements' && renderAnnouncementManagement()}
                {activeTab === 'assignments' && renderAssignmentManagement()}
                {activeTab === 'quizzes' && renderQuizManagement()}
                {activeTab === 'polls' && renderPollManagement()}
                {activeTab === 'settings' && renderSettingsManagement()}
            </div>
            {renderModal()}
        </div>
    );
};


// --- MAIN APP COMPONENT ---
const App = () => {
    const [users, setUsers] = useLocalStorage<User[]>('users', []);
    const [currentUser, setCurrentUser] = useLocalStorage<CurrentUser | null>('currentUser', null);
    const [route, setRoute] = useLocalStorage<Route>('route', { page: 'home' });
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [approvedMatricNumbers, setApprovedMatricNumbers] = useLocalStorage<string[]>('approvedMatricNumbers', INITIAL_MATRIC_NUMBERS);
    const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('announcements', []);
    const [gpaEntries, setGpaEntries] = useLocalStorage<GpaEntry[]>('gpaEntries', []);
    const [assignments, setAssignments] = useLocalStorage<Assignment[]>('assignments', []);
    const [resources, setResources] = useLocalStorage<Resource[]>('resources', []);
    const [customGrades, setCustomGrades] = useLocalStorage<CustomGrade[]>('customGrades', []);
    const [coursePlans, setCoursePlans] = useLocalStorage<CoursePlan[]>('coursePlans', []);
    const [forumThreads, setForumThreads] = useLocalStorage<ForumThread[]>('forumThreads', []);
    const [calendarEvents, setCalendarEvents] = useLocalStorage<CalendarEvent[]>('calendarEvents', []);
    const [flashcardSets, setFlashcardSets] = useLocalStorage<FlashcardSet[]>('flashcardSets', []);
    const [jobs, setJobs] = useLocalStorage<Job[]>('jobs', []);
    const [lostFoundItems, setLostFoundItems] = useLocalStorage<LostFoundItem[]>('lostFoundItems', []);
    const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);

    // NEW STATES FOR IMPLEMENTED FEATURES
    const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>('quizzes', []);
    const [quizSubmissions, setQuizSubmissions] = useLocalStorage<QuizSubmission[]>('quizSubmissions', []);
    const [polls, setPolls] = useLocalStorage<Poll[]>('polls', []);
    const [tutorProfiles, setTutorProfiles] = useLocalStorage<TutorProfile[]>('tutorProfiles', []);
    const [publicNotes, setPublicNotes] = useLocalStorage<PublicNote[]>('publicNotes', []);
    const [messages, setMessages] = useLocalStorage<Message[]>('messages', []);
    const [faculty, setFaculty] = useLocalStorage<Faculty[]>('faculty', []);
    const [systemSettings, setSystemSettings] = useLocalStorage('systemSettings', { maintenanceMode: false });
    
    // Make courses editable by admin
    const [coursesData, setCoursesData] = useLocalStorage<CoursesData>('coursesData', INITIAL_COURSES_DATA);
    
    const ALL_COURSE_CODES = useMemo(() => {
        return [...new Set(Object.values(coursesData).flatMap(s => Object.values(s).flat()).map(c => c.code))].sort();
    }, [coursesData]);


    // --- HANDLER FUNCTIONS ---

    const handleSignUp = (formData: SignUpFormData) => {
        const newUser: User = {
            ...formData,
            id: Date.now(),
            fullName: `${formData.firstName} ${formData.otherName} ${formData.surname}`.replace(/\s+/g, ' ').trim(),
            role: formData.email === ADMIN_EMAIL ? 'Admin' : 'Student',
            status: 'active',
            profilePicture: null
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        setRoute({ page: 'home' });
    };

    const handleSignIn = (user: User) => {
        const { password, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        setRoute({ page: 'home' });
    };

    const handleSignOut = () => {
        setCurrentUser(null);
        setRoute({ page: 'auth' });
    };

    const handleUpdateUser = (updatedUserData: Partial<User>) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...updatedUserData };
         if(updatedUserData.firstName || updatedUserData.otherName || updatedUserData.surname) {
            updatedUser.fullName = `${updatedUser.firstName} ${updatedUser.otherName} ${updatedUser.surname}`.replace(/\s+/g, ' ').trim();
        }
        setCurrentUser(updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, ...updatedUser } : u));
    };

    const createNotification = (userId: number, text: string, link?: Route) => {
        const newNotification: Notification = { id: Date.now(), userId, text, read: false, timestamp: Date.now(), link };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const handleMarkAsRead = (notificationId: number) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    };

    const handleAddAnnouncement = (data: { title: string; content: string }) => {
        const newAnnouncement: Announcement = { id: Date.now(), ...data, date: new Date().toLocaleDateString() };
        setAnnouncements(prev => [newAnnouncement, ...prev].sort((a,b) => b.id - a.id));
        users.forEach(u => u.id !== currentUser?.id && createNotification(u.id, `New Announcement: ${data.title}`, { page: 'announcements' }));
    };

    const handleAddGpaEntry = (entry: Omit<GpaEntry, 'id' | 'userId'>) => {
        if (!currentUser) return;
        const newEntry = { ...entry, id: Date.now(), userId: currentUser.id };
        setGpaEntries(prev => [...prev, newEntry]);
    };
    
    const handleAddAssignment = (data: Omit<Assignment, 'id'>) => {
        const newAssignment = { ...data, id: Date.now() };
        setAssignments(prev => [newAssignment, ...prev]);
        users.forEach(u => {
            if (u.id !== currentUser?.id) {
                createNotification(u.id, `New Assignment: ${newAssignment.title} for ${newAssignment.courseCode}`, { page: 'assignments' });
            }
        });
    };
    
    const handleAddResource = (data: Omit<Resource, 'id'>) => {
        const newResource = { ...data, id: Date.now() };
        setResources(prev => [newResource, ...prev]);
        users.forEach(u => {
            if (u.id !== currentUser?.id) {
                createNotification(u.id, `New Resource: ${newResource.title} for ${newResource.courseCode}`, { page: 'resourceLibrary' });
            }
        });
    };

    const handleAddCustomGrade = (grade: Omit<CustomGrade, 'id' | 'userId'>) => {
        if (!currentUser) return;
        setCustomGrades(prev => [...prev, { ...grade, id: Date.now(), userId: currentUser.id }]);
    };

    const handleUpdateCoursePlan = (semester: string, courseCodes: string[]) => {
        if (!currentUser) return;
        const existingPlanIndex = coursePlans.findIndex(p => p.userId === currentUser.id && p.semester === semester);
        if (existingPlanIndex > -1) {
            setCoursePlans(prev => prev.map((p, i) => i === existingPlanIndex ? { ...p, courseCodes } : p));
        } else {
            setCoursePlans(prev => [...prev, { userId: currentUser.id, semester, courseCodes }]);
        }
    };

    const handleAddForumThread = (data: { title: string, content: string }) => {
        if (!currentUser) return;
        const newThread: ForumThread = {
            id: Date.now(),
            title: data.title,
            authorId: currentUser.id,
            timestamp: Date.now(),
            posts: [{ id: Date.now() + 1, authorId: currentUser.id, content: data.content, timestamp: Date.now() }]
        };
        setForumThreads(prev => [newThread, ...prev]);
        users.forEach(u => {
            if (u.id !== currentUser.id) {
                createNotification(u.id, `New Forum Thread: "${newThread.title}"`, { page: 'viewForumThread', threadId: newThread.id });
            }
        });
    };
    
    const handleAddForumPost = (threadId: number, content: string) => {
        if (!currentUser) return;
        const newPost: ForumPost = { id: Date.now(), authorId: currentUser.id, content, timestamp: Date.now() };
        
        const thread = forumThreads.find(t => t.id === threadId);
        if (thread) {
            const participants = [...new Set(thread.posts.map(p => p.authorId))];
            participants.forEach(userId => {
                if (userId !== currentUser.id) {
                    createNotification(userId, `${currentUser.username} replied to "${thread.title}"`, { page: 'viewForumThread', threadId: thread.id });
                }
            });
        }
        
        setForumThreads(prev => prev.map(t => t.id === threadId ? { ...t, posts: [...t.posts, newPost] } : t));
    };
    
    const handleAddCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
        const newEvent = { ...event, id: Date.now() };
        setCalendarEvents(prev => [...prev, newEvent]);
        users.forEach(u => {
            if (u.id !== currentUser?.id) {
                createNotification(u.id, `New Calendar Event: ${newEvent.title} on ${newEvent.date}`, { page: 'calendar' });
            }
        });
    };

    const handleAddFlashcardSet = (set: { title: string, courseCode: string, cards: Omit<Flashcard, 'id'>[] }) => {
        if (!currentUser) return;
        const newSet = { ...set, id: Date.now(), creatorId: currentUser.id, cards: set.cards.map((c, i) => ({...c, id: Date.now() + i})) };
        setFlashcardSets(prev => [newSet, ...prev]);
    };
    
    const handleAddJob = (job: Omit<Job, 'id' | 'postedById'>) => {
        if (!currentUser) return;
        const newJob = { ...job, id: Date.now(), postedById: currentUser.id };
        setJobs(prev => [newJob, ...prev]);
        users.forEach(u => {
            if (u.id !== currentUser.id) {
                createNotification(u.id, `New Job Posting: ${newJob.title} at ${newJob.company}`, { page: 'jobs' });
            }
        });
    };

    const handleAddLostFoundItem = (item: Omit<LostFoundItem, 'id' | 'postedById' | 'timestamp'>) => {
        if (!currentUser) return;
        const newItem = { ...item, id: Date.now(), postedById: currentUser.id, timestamp: Date.now() };
        setLostFoundItems(prev => [newItem, ...prev]);
        users.forEach(u => {
            if (u.id !== currentUser.id) {
                createNotification(u.id, `New ${newItem.type} item: ${newItem.itemName}`, { page: 'lostAndFound' });
            }
        });
    };
    
    // --- NEW HANDLER FUNCTIONS ---

    const handleAddQuiz = (quizData: Omit<Quiz, 'id' | 'creatorId'>) => {
        if (!currentUser) return;
        const newQuiz = { ...quizData, id: Date.now(), creatorId: currentUser.id };
        setQuizzes(prev => [newQuiz, ...prev]);
         users.forEach(u => {
            if (u.id !== currentUser?.id) {
                createNotification(u.id, `New Quiz: "${newQuiz.title}" is available.`, { page: 'quizzes' });
            }
        });
    };
    
    const handleQuizSubmission = (submissionData: Omit<QuizSubmission, 'id' | 'timestamp'>) => {
        const newSubmission = { ...submissionData, id: Date.now(), timestamp: Date.now() };
        setQuizSubmissions(prev => [...prev, newSubmission]);
        return newSubmission.id;
    };

    const handleAddPoll = (pollData: Omit<Poll, 'id' | 'createdBy'>) => {
        if (!currentUser) return;
        const newPoll = { ...pollData, id: Date.now(), createdBy: currentUser.id };
        setPolls(prev => [newPoll, ...prev]);
        users.forEach(u => {
            if (u.id !== currentUser.id) {
                createNotification(u.id, `New Poll: "${newPoll.question}"`, { page: 'polls' });
            }
        });
    };
    
    const handleVote = (pollId: number, optionIndex: number) => {
        if (!currentUser) return;
        setPolls(prev => prev.map(poll => {
            if (poll.id === pollId) {
                const newOptions = poll.options.map((opt, i) => {
                    const filteredVotes = opt.votes.filter(v => v !== currentUser.id);
                    if (i === optionIndex) {
                        return { ...opt, votes: [...filteredVotes, currentUser.id] };
                    }
                    return { ...opt, votes: filteredVotes };
                });
                return { ...poll, options: newOptions };
            }
            return poll;
        }));
    };
    
    const handleRegisterTutor = (profileData: Omit<TutorProfile, 'userId'>) => {
        if (!currentUser) return;
        const existingProfile = tutorProfiles.find(p => p.userId === currentUser.id);
        if (existingProfile) {
            setTutorProfiles(prev => prev.map(p => p.userId === currentUser.id ? { ...p, ...profileData } : p));
        } else {
            setTutorProfiles(prev => [...prev, { ...profileData, userId: currentUser.id }]);
        }
    };
    
    const handleAddPublicNote = (noteData: Omit<PublicNote, 'id' | 'authorId'>) => {
        if (!currentUser) return;
        const newNote = { ...noteData, id: Date.now(), authorId: currentUser.id };
        setPublicNotes(prev => [newNote, ...prev]);
        users.forEach(u => {
            if (u.id !== currentUser.id) {
                createNotification(u.id, `New Public Note: "${newNote.title}" was added.`, { page: 'publicNotes' });
            }
        });
    };

    const handleSendMessage = (toId: number, text: string) => {
        if (!currentUser) return;
        const newMessage: Message = {
            id: Date.now(),
            from: currentUser.id,
            to: toId,
            text,
            timestamp: Date.now(),
            read: false
        };
        setMessages(prev => [...prev, newMessage]);
        createNotification(toId, `New message from ${currentUser.username}`, { page: 'messages', with: currentUser.id });
    };
    
    // --- ADMIN HANDLERS ---
    
    const handleUpdateUserStatus = (userId: number, status: User['status']) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    };
    const handleUpdateUserRole = (userId: number, role: User['role']) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    };
    const handleAddMatricNumber = (matric: string) => {
        setApprovedMatricNumbers(prev => [...prev, matric].sort());
    };
    const handleRemoveMatricNumber = (matric: string) => {
        setApprovedMatricNumbers(prev => prev.filter(m => m !== matric));
    };
    const handleUpdateAnnouncement = (updatedAnnouncement: Announcement) => {
        setAnnouncements(prev => prev.map(item => item.id === updatedAnnouncement.id ? updatedAnnouncement : item));
    };
    const handleDeleteAnnouncement = (id: number) => {
        setAnnouncements(prev => prev.filter(item => item.id !== id));
    };
    const handleUpdateAssignment = (updatedAssignment: Assignment) => {
        setAssignments(prev => prev.map(item => item.id === updatedAssignment.id ? updatedAssignment : item));
    };
    const handleDeleteAssignment = (id: number) => {
        setAssignments(prev => prev.filter(item => item.id !== id));
    };
    const handleAddCourse = (level: string, semester: string, course: Omit<Course, 'id'>) => {
        setCoursesData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            newData[level][semester].push({ ...course, id: Date.now() });
            return newData;
        });
    };
    const handleUpdateCourse = (level: string, semester: string, updatedCourse: Course) => {
        setCoursesData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            const courseIndex = newData[level][semester].findIndex((c: Course) => c.id === updatedCourse.id);
            if(courseIndex > -1) {
                newData[level][semester][courseIndex] = updatedCourse;
            }
            return newData;
        });
    };
    const handleDeleteCourse = (level: string, semester: string, courseId: number) => {
        setCoursesData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            newData[level][semester] = newData[level][semester].filter((c: Course) => c.id !== courseId);
            return newData;
        });
    };
    
    const handleAddFaculty = (facultyData: Omit<Faculty, 'id'>) => {
        let finalCourses = facultyData.courses;
        if (typeof facultyData.courses === 'string') {
            finalCourses = (facultyData.courses as string).split(',').map(c => c.trim()).filter(Boolean);
        }
        const newFaculty = { ...facultyData, id: Date.now(), courses: finalCourses };
        setFaculty(prev => [...prev, newFaculty]);
    };

    const handleUpdateFaculty = (updatedFacultyData: Faculty) => {
         let finalCourses = updatedFacultyData.courses;
        if (typeof updatedFacultyData.courses === 'string') {
            finalCourses = (updatedFacultyData.courses as string).split(',').map(c => c.trim()).filter(Boolean);
        }
        const finalData = {...updatedFacultyData, courses: finalCourses};
        setFaculty(prev => prev.map(f => f.id === finalData.id ? finalData : f));
    };

    const handleDeleteFaculty = (facultyId: number) => {
        if(window.confirm('Are you sure you want to delete this faculty member?')) {
            setFaculty(prev => prev.filter(f => f.id !== facultyId));
        }
    };

    const handleDeleteQuiz = (quizId: number) => {
        if (window.confirm('Are you sure you want to delete this quiz and all its submissions?')) {
            setQuizzes(prev => prev.filter(q => q.id !== quizId));
            setQuizSubmissions(prev => prev.filter(s => s.quizId !== quizId));
        }
    };

    const handleDeletePoll = (pollId: number) => {
        if (window.confirm('Are you sure you want to delete this poll?')) {
            setPolls(prev => prev.filter(p => p.id !== pollId));
        }
    };

    const handleUpdateSystemSettings = (settings: { maintenanceMode: boolean }) => {
        setSystemSettings(prev => ({ ...prev, ...settings }));
    };

    // --- RENDER LOGIC ---

    if (!currentUser) {
        return <AuthPage onSignIn={handleSignIn} onSignUp={handleSignUp} users={users} approvedMatricNumbers={approvedMatricNumbers} />;
    }
    
    if (systemSettings.maintenanceMode && currentUser.role !== 'Admin' && currentUser.role !== 'Class President') {
        return (
            <div className="maintenance-page">
                <h1>Under Maintenance</h1>
                <p>The portal is currently undergoing scheduled maintenance. Please check back later.</p>
            </div>
        );
    }


    const renderPage = () => {
        switch (route.page) {
            case 'home': return <HomePage currentUser={currentUser} announcements={announcements} setRoute={setRoute} />;
            case 'announcements': return <AnnouncementsPage announcements={announcements} currentUser={currentUser} onAddAnnouncement={handleAddAnnouncement} />;
            case 'courses': return <CoursesPage coursesData={coursesData} />;
            case 'coursePlanner': return <CoursePlannerPage currentUser={currentUser} coursePlans={coursePlans} onUpdateCoursePlan={handleUpdateCoursePlan} coursesData={coursesData} />;
            case 'faculty': return <FacultyDirectoryPage faculty={faculty} />;
            case 'assignments': return <AssignmentsPage assignments={assignments} currentUser={currentUser} onAddAssignment={handleAddAssignment} ALL_COURSE_CODES={ALL_COURSE_CODES} />;
            case 'resourceLibrary': return <ResourceLibraryPage resources={resources} currentUser={currentUser} onAddResource={handleAddResource} ALL_COURSE_CODES={ALL_COURSE_CODES} />;
            
            case 'quizzes': return <QuizzesPage quizzes={quizzes} submissions={quizSubmissions} currentUser={currentUser} setRoute={setRoute} />;
            case 'createQuiz': return <CreateQuizPage onAddQuiz={handleAddQuiz} setRoute={setRoute} ALL_COURSE_CODES={ALL_COURSE_CODES} />;
            case 'takeQuiz': {
                const quiz = quizzes.find(q => q.id === route.quizId);
                return quiz ? <TakeQuizPage quiz={quiz} currentUser={currentUser} onSubmit={handleQuizSubmission} setRoute={setRoute} /> : <div>Quiz not found.</div>;
            }
            case 'quizResults': {
                const submission = quizSubmissions.find(s => s.id === route.submissionId);
                const quiz = submission ? quizzes.find(q => q.id === submission.quizId) : null;
                return (quiz && submission) ? <QuizResultsPage quiz={quiz} submission={submission} setRoute={setRoute} /> : <div>Results not found.</div>;
            }

            case 'flashcards': return <FlashcardsPage flashcardSets={flashcardSets} currentUser={currentUser} setRoute={setRoute} />;
            case 'createFlashcardSet': return <CreateFlashcardSetPage onAddSet={handleAddFlashcardSet} setRoute={setRoute} ALL_COURSE_CODES={ALL_COURSE_CODES} />;
            case 'viewFlashcardSet': {
                const set = flashcardSets.find(s => s.id === route.setId);
                return set ? <ViewFlashcardSetPage set={set} setRoute={setRoute} /> : <div>Set not found.</div>;
            }

            case 'gradebook': return <GradebookPage currentUser={currentUser} customGrades={customGrades} onAddCustomGrade={handleAddCustomGrade} ALL_COURSE_CODES={ALL_COURSE_CODES} />;
            case 'gpaCalculator': return <GpaCalculatorPage currentUser={currentUser} gpaEntries={gpaEntries} onAddGpaEntry={handleAddGpaEntry} />;
            
            case 'forums': return <ForumsPage threads={forumThreads} currentUser={currentUser} onAddForumThread={handleAddForumThread} users={users} setRoute={setRoute} />;
            case 'viewForumThread': {
                const thread = forumThreads.find(t => t.id === route.threadId);
                return thread ? <ViewForumThreadPage thread={thread} users={users} currentUser={currentUser} onAddPost={handleAddForumPost} setRoute={setRoute} /> : <div>Thread not found.</div>;
            }
            
            case 'polls': return <PollsPage polls={polls} currentUser={currentUser} onAddPoll={handleAddPoll} onVote={handleVote} />;
            case 'calendar': return <CalendarPage events={calendarEvents} currentUser={currentUser} onAddEvent={handleAddCalendarEvent} />;
            case 'members': return <MembersPage users={users} setRoute={setRoute} />;
            case 'messages': return <MessagesPage currentUser={currentUser} users={users} messages={messages} onSendMessage={handleSendMessage} route={route} setRoute={setRoute} />;
            case 'tutoring': return <TutoringMarketplacePage currentUser={currentUser} users={users} tutorProfiles={tutorProfiles} onRegisterTutor={handleRegisterTutor} />;
            case 'jobs': return <JobBoardPage jobs={jobs} currentUser={currentUser} onAddJob={handleAddJob} />;
            case 'lostAndFound': return <LostAndFoundPage items={lostFoundItems} currentUser={currentUser} onAddItem={handleAddLostFoundItem} users={users} />;
            case 'publicNotes': return <PublicNotesPage currentUser={currentUser} publicNotes={publicNotes} onAddPublicNote={handleAddPublicNote} users={users} />;
            
            case 'profile': return <ProfilePage currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
            case 'admin': return <AdminPanelPage 
                users={users} onUpdateUserStatus={handleUpdateUserStatus} onUpdateUserRole={handleUpdateUserRole} 
                approvedMatricNumbers={approvedMatricNumbers} onAddMatricNumber={handleAddMatricNumber} onRemoveMatricNumber={handleRemoveMatricNumber}
                coursesData={coursesData} onAddCourse={handleAddCourse} onUpdateCourse={handleUpdateCourse} onDeleteCourse={handleDeleteCourse}
                announcements={announcements} onUpdateAnnouncement={handleUpdateAnnouncement} onDeleteAnnouncement={handleDeleteAnnouncement}
                assignments={assignments} onUpdateAssignment={handleUpdateAssignment} onDeleteAssignment={handleDeleteAssignment}
                faculty={faculty} onAddFaculty={handleAddFaculty} onUpdateFaculty={handleUpdateFaculty} onDeleteFaculty={handleDeleteFaculty}
                quizzes={quizzes} onDeleteQuiz={handleDeleteQuiz}
                polls={polls} onDeletePoll={handleDeletePoll}
                systemSettings={systemSettings} onUpdateSystemSettings={handleUpdateSystemSettings}
             />;
            default: return <div>Page not found.</div>;
        }
    };
    
    const userNotifications = notifications.filter(n => n.userId === currentUser.id);

    return (
        <div className="app-layout">
            <Analytics />
            <Sidebar route={route} setRoute={setRoute} isSidebarOpen={isSidebarOpen} />
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
            <div className="main-content-wrapper">
                <Header 
                    currentUser={currentUser} 
                    onSignOut={handleSignOut} 
                    notifications={userNotifications}
                    setRoute={setRoute}
                    onMarkAsRead={handleMarkAsRead}
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
                />
                <main className="main">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
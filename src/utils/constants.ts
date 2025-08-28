import { CoursesData } from '../types';

export const ADMIN_EMAIL = 'oladoyeheritage445@gmail.com';

export const INITIAL_MATRIC_NUMBERS = [
  "2024013417", "2023011476", "2024003355", "0000000001", "2024003476", 
  "2024003486", "2024003513", "2024003516", "2024003580", "2024003583", 
  "2024003607", "2024013214", "2024003667", "2024003692", "2024003712", 
  "2024003741", "2024003770", "2024003869", "2024003999", "2024004028", 
  "2024004029", "2024004099", "2024013216", "2024004177", "2024004271", 
  "2024004308", "2024004334", "2024004407", "2024004417", "2024004487", 
  "2024004507", "2024004527", "2024004576", "2024013223", "2024004590", 
  "2024004622", "2024004637", "2024004691", "2024004703", "2024004723", 
  "2024004794", "2024004798", "2024004808", "2024004869", "2024013378", 
  "2024004891", "2024004893", "2024004895", "2024004932", "2024004947", 
  "2024004956", "2024004962", "2024004973", "2024005008", "2024005013", 
  "2024013391", "2024005068", "2024005150", "2024005156", "2024005157", 
  "2024005182", "2024005345", "2024005353", "2024005378", "2024005477", 
  "2024005507", "2024005508", "2024005528", "2024005546", "2024005655", 
  "2024005738", "2024005753", "2024005754", "2024005797", "2024005847", 
  "2024005864", "2024005867", "2024005916", "2024006090", "2024006118", 
  "2024006125", "2024006136", "2024006143", "2024006150", "2024006162", 
  "2024006198", "2024006437", "2024006447", "2024006477", "2024006510", 
  "2024006513", "2024006550", "2024006564", "2024006597", "2024006626", 
  "2024006686", "2024006705", "2024006820", "2024006896", "2024006904", 
  "2024006969", "2024006978", "2024006998", "2024007000", "2024007087", 
  "2024007117", "2024007153", "2024007169", "2024007175", "2024007310", 
  "2024007325", "2024007467", "2024007512", "2024007527", "2024007578", 
  "2024007587", "2024007588", "2024007589", "2024007663", "2024007675", 
  "2024007681", "2024007693", "2024007696", "2024007744", "2024007756", 
  "2024007796", "2024007814", "2024007823", "2024007944", "2024007974", 
  "2024007977", "2024008002", "2024008028", "2024008059", "2024008076", 
  "2024008087", "2024008233", "2024008338", "2024008357", "2024008415", 
  "2024008420", "2024008458", "2024008554", "2024008575", "2024008612", 
  "2024008680", "2024008710", "2024008757", "2024008761", "2024008777", 
  "2024008838", "2024008890", "2024008929", "2024008942", "2024008971", 
  "2024009104", "2024009209", "2024009324", "2024009342", "2024009347", 
  "2024009384", "2024009455", "2024009461", "2024009479", "2024009537", 
  "2024009587", "2024009652", "2024009736", "2024009834", "2024009872", 
  "2024009874", "2024009932", "2024009937", "2024009967", "2024010177", 
  "2024010178", "2024010194", "2024010213", "2024010379", "2024010502", 
  "2024010544", "2024010624", "2024010690", "2024010710", "2024010829", 
  "2024010853", "2024010866", "2024010883", "2024010985", "2024011008", 
  "2024011028", "2024011047", "2024011048", "2024011125", "2024011144", 
  "2024011160", "2024011162", "2024011316", "2024011351", "2024011367", 
  "2024011464", "2024011522", "2024011526", "2024011567", "2024011593", 
  "2024011630", "2024011850", "2024011924", "2024012314", "2024012318", 
  "2024012400", "2024012493", "2024012547", "2024012628", "2024012666", 
  "2024012674", "2024012792", "2024012879", "2024012918", "2024012939", 
  "2024013017", "2024013035", "2024013060", "2024013164", "2024013180"
];

export const INITIAL_COURSES_DATA: CoursesData = {
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
**EDT Manager** is a responsive web application that lets students visualize their timetable in a **clear, modern, and interactive way**.
It automatically **fetches and parses data** from the official schedule website and displays it in a **grid view (desktop)** or **list view (mobile)**, with **color-coded subjects** and detailed course information.

[![wakatime](https://wakatime.com/badge/user/018e9f6e-3f6e-41ca-8923-c1d7110b6f50/project/80e09c90-a778-4b9f-a5c2-114ebfe336d9.svg)](https://wakatime.com/badge/user/018e9f6e-3f6e-41ca-8923-c1d7110b6f50/project/80e09c90-a778-4b9f-a5c2-114ebfe336d9)

![React.js](https://img.shields.io/badge/React-v18.2.0-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646cff?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38bdf8?logo=tailwindcss)
![Axios](https://img.shields.io/badge/Axios-1.12.2-5a29e4?logo=axios)
![Lucide React](https://img.shields.io/badge/Lucide-Icons-yellow?logo=lucide)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🖼️ **Preview**

![App Preview](public/preview.png)

---

## 🏫 Écoles supportées

| École      | Logo                                                                   | Statut     |
| ---------- | ---------------------------------------------------------------------- | ---------- |
| 3A         | <img alt="3A" src="public/logos/3A.png" height="40" />                 | À tester   |
| IFAG       | <img alt="IFAG" src="public/logos/IFAG.png" height="40" />             | **Validé** |
| IDRAC      | <img alt="IDRAC" src="public/logos/IDRAC.png" height="40" />           | **Validé** |
| EPSI       | <img alt="EPSI" src="public/logos/EPSI.png" height="40" />             | **Validé** |
| WIS        | <img alt="WIS" src="public/logos/WIS.png" height="40" />               | **Validé** |
| SUP'DE COM | <img alt="SUP'DE COM" src="public/logos/SUPDECOM.png" height="40" />   | À tester   |
| IET        | <img alt="IET" src="public/logos/IET.png" height="40" />               | À tester   |
| ICL        | <img alt="ICL" src="public/logos/ICL.png" height="40" />               | À tester   |
| IEFT       | <img alt="IEFT" src="public/logos/IEFT.png" height="40" />             | À tester   |
| IGEFI      | <img alt="IGEFI" src="public/logos/IGEFI.png" height="40" />           | À tester   |
| IHEDREA    | <img alt="IHEDREA" src="public/logos/IHEDREA.png" height="40" />       | À tester   |
| ILERI      | <img alt="ILERI" src="public/logos/ILERI.png" height="40" />           | À tester   |
| VIVA MUNDI | <img alt="VIVA MUNDI" src="public/logos/VIVA_MUNDI.png" height="40" /> | À tester   |
| ESAIL      | <img alt="ESAIL" src="public/logos/ESAIL.png" height="40" />           | À tester   |
| FIGS       | <img alt="FIGS" src="public/logos/FIGS.png" height="40" />             | À tester   |

---

## ⚙ **Tech Stack**

| Category              | Technologies                                                   |
| --------------------- | -------------------------------------------------------------- |
| **Frontend**          | React + TypeScript + Vite                                      |
| **Styling**           | Tailwind CSS                                                   |
| **Icons**             | Lucide React                                                   |
| **HTTP Requests**     | Axios                                                          |
| **HTML Parsing**      | DOMParser (to transform the HTML schedule into Course objects) |
| **Color Management**  | Dynamic color mapping by subject                               |
| **Responsive Design** | Grid layout for desktop / list layout for mobile               |

---

---

## 🚀 **Installation**

### 1. Clone the project

```bash
git clone https://github.com/D-Seonay/edt-hep.git
cd edt-hep
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

### 4. Open the app

Visit 👉 [http://localhost:8080](http://localhost:8080)

---

## 🧩 **Project Structure**

```
src/
 ├─ components/
 │   ├─ TimeGrid.tsx          # Responsive grid / list display
 │   ├─ CourseBlock.tsx       # Course block with modal details
 ├─ services/
 │   └─ scheduleService.ts    # HTML parsing, data fetching, color & week management
 ├─ lib/
 │   └─ utils.ts              # Utility functions
 ├─ App.tsx
 └─ main.tsx
```

---

## 🤝 **Contributing**

If you want to contribute:

1. **Fork** the repository
2. Create your feature branch

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes

   ```bash
   git commit -m "Add: new feature"
   ```
4. Push your branch

   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a **Pull Request**

---

## 📜 **License**

This project is licensed under the [MIT License](LICENSE).
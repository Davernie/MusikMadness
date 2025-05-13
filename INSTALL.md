# MusikMadness 2.0 - Installation Guide

This guide provides detailed step-by-step instructions for installing and setting up MusikMadness 2.0 on various operating systems.

## Prerequisites

Before you begin, ensure you have the following:
- Internet connection
- Administrator access to your machine (for installing software)
- Basic familiarity with command line interfaces

## Windows Installation

### 1. Install Node.js and npm

1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS (Long Term Support) version for Windows
3. Run the installer and follow the on-screen instructions
   - Ensure "npm package manager" is selected during installation
   - Allow the installer to set up necessary environment variables
4. Verify installation by opening Command Prompt or PowerShell and typing:
   ```
   node --version
   npm --version
   ```

### 2. Install Git (If not already installed)

1. Visit [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Download and run the installer
3. Use the default settings unless you have specific preferences
4. Verify installation:
   ```
   git --version
   ```

### 3. Clone and Set Up the Repository

1. Open Command Prompt or PowerShell
2. Navigate to the directory where you want to install the application:
   ```
   cd C:\path\to\desired\folder
   ```
3. Clone the repository:
   ```
   git clone https://github.com/yourusername/MusikMadness2.0.git
   ```
4. Navigate to the project folder:
   ```
   cd MusikMadness2.0
   ```
5. Install dependencies:
   ```
   npm install
   ```

### 4. Run the Application

1. Start the development server:
   ```
   npm run dev
   ```
2. Open your web browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

## macOS Installation

### 1. Install Node.js and npm

#### Using Homebrew (Recommended):
1. Install Homebrew if not already installed:
   ```
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Install Node.js and npm:
   ```
   brew install node
   ```

#### Alternative method:
1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer and follow the on-screen instructions

3. Verify installation:
   ```
   node --version
   npm --version
   ```

### 2. Clone and Set Up the Repository

1. Open Terminal
2. Navigate to the directory where you want to install the application:
   ```
   cd /path/to/desired/folder
   ```
3. Clone the repository:
   ```
   git clone https://github.com/yourusername/MusikMadness2.0.git
   ```
4. Navigate to the project folder:
   ```
   cd MusikMadness2.0
   ```
5. Install dependencies:
   ```
   npm install
   ```

### 3. Run the Application

1. Start the development server:
   ```
   npm run dev
   ```
2. Open your web browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

## Linux Installation (Ubuntu/Debian)

### 1. Install Node.js and npm

1. Update your package index:
   ```
   sudo apt update
   ```
2. Install Node.js and npm:
   ```
   sudo apt install nodejs npm
   ```
3. For newer versions of Node.js, use the NodeSource repository:
   ```
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. Verify installation:
   ```
   node --version
   npm --version
   ```

### 2. Clone and Set Up the Repository

1. Open Terminal
2. Navigate to the directory where you want to install the application:
   ```
   cd /path/to/desired/folder
   ```
3. Clone the repository:
   ```
   git clone https://github.com/yourusername/MusikMadness2.0.git
   ```
4. Navigate to the project folder:
   ```
   cd MusikMadness2.0
   ```
5. Install dependencies:
   ```
   npm install
   ```

### 3. Run the Application

1. Start the development server:
   ```
   npm run dev
   ```
2. Open your web browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

## Docker Installation (Alternative)

For containerized deployment, you can use Docker:

### 1. Install Docker

Follow the installation guide for your OS: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)

### 2. Build and Run the Docker Container

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/MusikMadness2.0.git
   cd MusikMadness2.0
   ```
2. Build the Docker image:
   ```
   docker build -t musikmadness2 .
   ```
3. Run the container:
   ```
   docker run -p 5173:5173 musikmadness2
   ```
4. Access the application at: http://localhost:5173

## Troubleshooting

### Node.js/npm Version Issues

If you encounter problems related to Node.js version:

1. Install Node Version Manager (nvm):
   - Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows)
   - macOS/Linux: 
     ```
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
     ```
2. Install the required Node.js version:
   ```
   nvm install 16
   nvm use 16
   ```
3. Reinstall dependencies:
   ```
   npm install
   ```

### Package Installation Errors

If npm install fails:

1. Delete node_modules folder and package-lock.json:
   ```
   rm -rf node_modules package-lock.json
   ```
2. Clear npm cache:
   ```
   npm cache clean --force
   ```
3. Reinstall dependencies:
   ```
   npm install
   ```

### Port Conflicts

If the default port (5173) is already in use:

1. Specify a different port:
   ```
   npm run dev -- --port 3000
   ```

## Support and Resources

- Check the [DEPENDENCIES.md](./DEPENDENCIES.md) file for more information about the project's dependencies
- Visit the [React documentation](https://reactjs.org/docs/getting-started.html) for help with React
- Visit the [TailwindCSS documentation](https://tailwindcss.com/docs) for styling help
- For project-specific issues, create an issue in the GitHub repository

---

© 2024 MusikMadness 2.0 
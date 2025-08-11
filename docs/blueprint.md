# **App Name**: QRAuth

## Core Features:

- User Account Creation: User registration and profile generation after the first login.
- QR Code Generation: Generation of a unique QR code linked to the user's account to enable login from another device.
- Login Method Tabs: Display options for switching between login methods (QR code and traditional login/password) through a tab interface.
- Camera Integration: Integration with device camera using WebRTC when the 'Login via QR' tab is selected. Display of the camera view in full screen within the application.
- QR Code Scanning: Processing of camera feed to scan and recognize QR codes. Highlight the found code with an animated square frame for user confirmation, utilizing jsQR or html5-qrcode as a tool.
- Login Confirmation Animation: Visual confirmation on QR login using animation for successful authentication.

## Style Guidelines:

- Primary color: Soft purple (#A084CA) to give a modern yet trustworthy feel, subtly alluding to themes of access and security.
- Background color: Light gray (#F0F0F0), almost white to keep a focus on the login options and visual clarity.
- Accent color: Teal (#77D8D8), distinct and eye-catching for buttons and highlights.
- Body and headline font: 'Inter' (sans-serif), for a modern and neutral appearance that works well on screens.
- Simple, line-based icons to maintain a minimalist style, with a focus on security-related symbols (keys, locks, etc.).
- Clean and centered layout, with clear sections for login options, to minimize clutter.
- Subtle animations for tab transitions and the QR code scanning frame to create a smooth user experience.
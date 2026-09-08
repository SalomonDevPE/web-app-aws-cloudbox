# ☁️ CloudBox

**CloudBox** es una plataforma web de almacenamiento de archivos en la nube, desarrollada como proyecto académico para **Seminario de Complementación Práctica III – SENATI**.

El sistema permite a los usuarios autenticarse y gestionar sus archivos y carpetas desde una interfaz web moderna, utilizando una arquitectura basada en **React + TypeScript** para el frontend y **ASP.NET Core Web API** para el backend.

## 🚀 Características

- 🔐 Registro e inicio de sesión de usuarios.
- 👤 Autenticación mediante tokens JWT.
- 📁 Creación y gestión de carpetas.
- 📄 Gestión de archivos.
- ⬆️ Subida de archivos.
- ⬇️ Descarga de archivos.
- 🔎 Consulta de archivos.
- 🗂️ Organización de archivos mediante carpetas.
- 📱 Diseño responsive.
- 🌓 Interfaz moderna.
- ☁️ Despliegue utilizando servicios de AWS.

## 🏗️ Arquitectura

El proyecto está dividido en dos aplicaciones principales:

```text
web-app-aws-cloudbox
│
├── web-app-aws-cloudbox.Server
│   └── Backend / API REST
│
├── web-app-aws-cloudbox.client
│   └── Frontend
│
├── web-app-aws-cloudbox.sln
├── .gitignore
└── README.md

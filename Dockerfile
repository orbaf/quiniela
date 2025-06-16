# -------- Base stage --------
    FROM node:22.1.0 AS base

    WORKDIR /app
    
    COPY package.json yarn.lock ./
    
    # -------- Development stage --------
    FROM base AS development
    
    RUN yarn install
    
    # Evita conflictos de volumen con node_modules en el host
    COPY . .
    
    EXPOSE 3000
    
    CMD ["npx", "nodemon", "index.js"]
    
    # -------- Production stage --------
    FROM base AS production
    
    # Instalación de solo dependencias necesarias
    RUN yarn install --production
    
    COPY . .
    
    EXPOSE 3000
    
    CMD ["node", "index.js"]
    
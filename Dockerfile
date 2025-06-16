# Usar la imagen oficial de Node.js versión 22.16.0
FROM node:22.16.0

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias
COPY package.json yarn.lock ./

# Instalar las dependencias
RUN yarn install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"] 
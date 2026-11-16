CREATE DATABASE IF NOT EXISTS flota CHARACTER SET utf8mb4;
USE flota;
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(60) NOT NULL,
  modelo VARCHAR(60) NOT NULL,
  patente VARCHAR(10) NOT NULL UNIQUE,
  anio SMALLINT NOT NULL,
  capacidad_carga DECIMAL(10,2) NOT NULL,
  CONSTRAINT chk_vehiculos_capacidad CHECK (capacidad_carga >= 0)
);
CREATE TABLE IF NOT EXISTS conductores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL,
  apellido VARCHAR(60) NOT NULL,
  numero_documento VARCHAR(15) NOT NULL UNIQUE,
  numero_licencia VARCHAR(20) NOT NULL UNIQUE,
  fecha_alta_licencia DATE NOT NULL,
  fecha_vencimiento_licencia DATE NOT NULL,
  CONSTRAINT chk_conductores_fechas CHECK (fecha_vencimiento_licencia > fecha_alta_licencia)
);
CREATE TABLE IF NOT EXISTS viajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id INT NOT NULL,
  conductor_id INT NOT NULL,
  fecha_salida DATE NOT NULL,
  fecha_llegada DATE NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  kilometros DECIMAL(10,2) NOT NULL,
  observaciones TEXT NULL,
  CONSTRAINT chk_viajes_kilometros CHECK (kilometros >= 0),
  CONSTRAINT chk_viajes_fechas CHECK (fecha_llegada >= fecha_salida),
  CONSTRAINT fk_viajes_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_viajes_conductor FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

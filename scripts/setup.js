import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const root=path.dirname(fileURLToPath(import.meta.url));
const conn=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'agrocontrol',multipleStatements:true});
const schema=fs.readFileSync(path.join(root,'../database/schema.sql'),'utf8').replace(/^CREATE DATABASE IF NOT EXISTS[^;]+;\s*USE agrocontrol;\s*/i,'');
await conn.query(schema);
const rl=createInterface({input:process.stdin,output:process.stdout});
try {
 const [rows]=await conn.query('SELECT id FROM usuarios LIMIT 1');
 if(rows.length){console.log('La base ya tiene usuarios. No se creó otra cuenta.');}
 else {const nombre=(await rl.question('Nombre del administrador general: ')).trim();const correo=(await rl.question('Correo para iniciar sesión: ')).trim().toLowerCase();const clave=await rl.question('Contraseña inicial (mínimo 10 caracteres): ');if(!nombre||!correo.includes('@')||clave.length<10)throw new Error('Completa los datos y usa una contraseña de al menos 10 caracteres.');const hash=await bcrypt.hash(clave,12);await conn.execute('INSERT INTO usuarios(nombre,correo,clave_hash,rol) VALUES(?,?,?,?)',[nombre,correo,hash,'administrador_general']);console.log('Administrador creado. Inicia AgroControl con npm start.');}
} finally {rl.close();await conn.end();}

import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';


function copyDirRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) throw new Error(`Diretório de origem não existe: ${src}`);
  
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((child) => {
      copyDirRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Iniciando script de build "flat"...');

try {
  const dist = 'dist';
  
  console.log(`Limpando diretório '${dist}'...`);
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist);

  console.log("Copiando 'manifest.json'...");
  fs.copyFileSync('manifest.json', path.join(dist, 'manifest.json'));

  console.log("Copiando 'src/popup/' para 'dist/'...");
  copyDirRecursiveSync('src/popup', dist); 


  console.log("Copiando 'src/background/' para 'dist/'...");
  copyDirRecursiveSync('src/background', dist); 
  
  console.log("Copiando 'imagens/' para 'dist/imagens/'...");
  copyDirRecursiveSync('imagens', path.join(dist, 'imagens')); 

  console.log('Iniciando compactação .zip...');
  const output = fs.createWriteStream(path.join(dist, 'extension.zip'));
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('warning', (err) => console.warn('Aviso do Archiver:', err));
  archive.on('error', (err) => { throw err; });

  const archivePromise = new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
  });

  archive.pipe(output);
  archive.directory(dist, false, (entry) => {
    return entry.name.endsWith('.zip') ? false : entry;
  });

  console.log('Finalizando arquivo .zip...');
  await archive.finalize();
  await archivePromise;

  console.log('-------------------------------------------');
  console.log('✅ SUCESSO! Build "flat" gerado em dist/');
  console.log('-------------------------------------------');

} catch (error) {
  console.error('-------------------------------------------');
  console.error('❌ ERRO NO BUILD:');
  console.error(error.message);
  console.error(error.stack);
  console.error('-------------------------------------------');
  process.exit(1);
}
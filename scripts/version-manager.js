#!/usr/bin/env node

/**
 * Gerenciador de Versão - Sistema de Versionamento Semântico
 * Formato: V{MAJOR}.{MINOR}.{PATCH}
 * Exemplo: V1.0.000
 * 
 * Cada deploy incrementa o número de patch (último dígito)
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, '..', '.version');
const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');

function readVersion() {
  try {
    const content = fs.readFileSync(VERSION_FILE, 'utf8').trim();
    const match = content.match(/V(\d+)\.(\d+)\.(\d+)/);
    if (match) {
      return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
        full: content
      };
    }
  } catch (e) {
    // Arquivo não existe, retornar versão inicial
  }
  return { major: 1, minor: 0, patch: 0, full: 'V1.0.000' };
}

function writeVersion(version) {
  const versionString = `V${version.major}.${version.minor}.${version.patch.toString().padStart(3, '0')}`;
  fs.writeFileSync(VERSION_FILE, versionString, 'utf8');
  return versionString;
}

function incrementVersion(type = 'patch') {
  const version = readVersion();
  
  if (type === 'major') {
    version.major++;
    version.minor = 0;
    version.patch = 0;
  } else if (type === 'minor') {
    version.minor++;
    version.patch = 0;
  } else {
    // patch (padrão)
    version.patch++;
  }
  
  return writeVersion(version);
}

function getBuildNumber() {
  // Build number baseado em timestamp (últimos 6 dígitos)
  const timestamp = Date.now();
  return timestamp.toString().slice(-6);
}

function getBuildDate() {
  return new Date().toISOString();
}

// CLI
const command = process.argv[2];
const arg = process.argv[3];

if (command === 'get') {
  const version = readVersion();
  console.log(version.full);
} else if (command === 'increment') {
  const newVersion = incrementVersion(arg || 'patch');
  console.log(newVersion);
} else if (command === 'build') {
  const buildNumber = getBuildNumber();
  console.log(buildNumber);
} else if (command === 'info') {
  const version = readVersion();
  const buildNumber = getBuildNumber();
  const buildDate = getBuildDate();
  console.log(JSON.stringify({
    version: version.full,
    build: buildNumber,
    buildDate: buildDate,
    major: version.major,
    minor: version.minor,
    patch: version.patch
  }, null, 2));
} else {
  console.log(`
Uso: node scripts/version-manager.js <comando> [argumento]

Comandos:
  get              - Retorna versão atual (ex: V1.0.000)
  increment [type] - Incrementa versão (major|minor|patch, padrão: patch)
  build            - Retorna número de build
  info             - Retorna JSON com versão, build e data
  `);
  process.exit(1);
}

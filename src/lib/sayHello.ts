/* eslint-disable no-console */
/* eslint-disable no-irregular-whitespace */

export default function sayHello() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return;

  console.log(
    '%c██   ██ ███████ ██      ██       ██████      ██████  ███████ ██    ██ ███████ ██       ██████  ██████  ███████ ██████  ██\n' +
    '%c██   ██ ██      ██      ██      ██    ██     ██   ██ ██      ██    ██ ██      ██      ██    ██ ██   ██ ██      ██   ██ ██\n' +
    '%c███████ █████   ██      ██      ██    ██     ██   ██ █████   ██    ██ █████   ██      ██    ██ ██████  █████   ██████  ██\n' +
    '%c██   ██ ██      ██      ██      ██    ██     ██   ██ ██       ██  ██  ██      ██      ██    ██ ██      ██      ██   ██   \n' +
    '%c██   ██ ███████ ███████ ███████  ██████      ██████  ███████   ████   ███████ ███████  ██████  ██      ███████ ██   ██ ██',
    'color: #4ee5ae;',
    'color: #4ee6a8;',
    'color: #4ee5ac;',
    'color: #4ee5b4;',
    'color: #4ee2d9;'
  );

  console.log(
    '%c🏥 WELCOME TO SJHRC\n' +
    '%cSHREE JAGANNATH HOSPITAL & RESEARCH CENTRE\n\n' +
    '%c📍 Address:\n' +
    '%cMayor\'s Road - Booty Road, Radium Rd,\n' +
    'Behind Machali Ghar, Ranchi, Jharkhand 834001\n\n' +
    '%c📞 Contact:\n' +
    '%c+91 89879 99200\n' +
    '+91 94713 73714\n\n' +
    '%c🚨 24X7 Emergency Service Available',
    'font-family: Inter, sans-serif; font-size: 1.8rem; font-weight: 700; color: #4ee6a8;',
    'font-family: Inter, sans-serif; font-size: 1.3rem; font-weight: 600; color: #4ee5b4;',
    'font-family: Inter, sans-serif; font-size: 1.2rem; font-weight: 600; color: #4ee2d9;',
    'font-family: Inter, sans-serif; font-size: 1.1rem; color: #4ee5ac;',
    'font-family: Inter, sans-serif; font-size: 1.2rem; font-weight: 600; color: #4ee2d9;',
    'font-family: Inter, sans-serif; font-size: 1.1rem; color: #4ee5ac;',
    'font-family: Inter, sans-serif; font-size: 1.2rem; font-weight: 600; color: #ff6b6b;'
  );
}
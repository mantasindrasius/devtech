export async function openBrowser(url: string) {
  const commands: Record<string, string[]> = {
    darwin: ['open', url],
    win32: ['cmd', '/c', 'start', '', url],
    linux: ['xdg-open', url],
  };
  try {
    const command = commands[process.platform];
    if (!command) throw new Error('No browser launcher for this platform.');
    const result = Bun.spawn(command, { stdout: 'ignore', stderr: 'ignore' });
    if ((await result.exited) !== 0) throw new Error('Browser launcher failed.');
    console.log(`Opened the browser at ${url}`);
  } catch {
    // A headless machine can still run the app; the URL is sufficient to connect.
    console.warn(`Open ${url} in your browser.`);
  }
}

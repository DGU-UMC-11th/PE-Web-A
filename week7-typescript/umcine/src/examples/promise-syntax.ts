export {};
function getMovieTitle(): Promise<string> { return Promise.resolve("인셉션"); }
function loadWithThen() {
  return getMovieTitle().then((title) => console.log(`.then(): ${title}`)).catch(console.error);
}
async function loadWithAsyncAwait() {
  try { console.log(`async/await: ${await getMovieTitle()}`); }
  catch (error) { console.error(error); }
}
loadWithThen();
loadWithAsyncAwait();

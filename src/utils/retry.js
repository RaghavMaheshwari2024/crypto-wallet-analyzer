export async function retryWithBackoff(fn, retries = 5) {

  let delay = 1000;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {

      if (i === retries - 1) throw err;

      console.log(`Retry attempt ${i + 1}`);

      await new Promise(res => setTimeout(res, delay));

      delay *= 2;
    }
  }
}

export default {
  retryWithBackoff
};
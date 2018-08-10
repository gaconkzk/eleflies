// interval(5000, fn)
export function interval(ms, fn) {
  let timerId = setTimeout(function tick() {
    fn()
    timerId = setTimeout(tick, ms)
  }, ms)

  return timerId
}

export function timeoutPromise(ms, promise) {
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error('Timed out in ' + ms + 'ms.'))
    }, ms)
  })

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ])
}

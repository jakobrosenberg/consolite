/**
 * eats process.stdout and returns an array of strings
 * @param {Function} callback 
 * @returns {string[]}
 */
export const stdNout = callback => {
    const lines = []
    const oldWrite = process.stdout.write
    process.stdout.write = function(string, encoding){
        lines.push(string)
    }
    callback()
    process.stdout.write = oldWrite
    return lines.map(line => line.replace(/\n/, ''))
}

export const test = (msg, cb) => {
    try {
        cb()
        console.log(msg, '✅')
    }catch(err){
        console.log(msg, '❌')
        console.error(err)
    }
}

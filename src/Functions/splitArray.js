/**
 * 
 * @param {Array} array 
 * @param {*} Options 
 */

module.exports.defulte =  async (array,Limit) => {
    let member_splited = []
    for (let i = 0; i < array.length; i += Limit) {
        const chunk = array.slice(i, i + Limit);
        member_splited.push(chunk)
        // do whatever
     
    }

    return member_splited

}

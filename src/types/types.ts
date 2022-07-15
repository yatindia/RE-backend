// export type signup  = {
//     name: string,

//     email: string,

//     password: string,

//     phone_number: {
//         type: string,
//         required: true
//     },
// }

export type response = {
    status:boolean,
    message:string,
    data?: string | object | number,
    errorMessage?: any
}
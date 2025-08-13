export const asyncHandler = (fn)=>{
  return async (req ,res ,next)=>{
    await fn(req , res ,next ).catch(error=>{
      return next(error , {cause:500})
    }) 
  }
}


export const successResponse = ({res , message = "done" , data = {} , status = 200}={} ) =>{
  return res.status(status).json({message , data})
} 



export const globalErrorHandling = (error , req ,res ,next )=>{
    res.status(error.cause || 400).json({
      message:error.message ,
      stack: error.stack
    })
  }
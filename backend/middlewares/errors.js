const ErrorHandler=require("../utils/errorHandler");

module.exports=(err,req,res,next)=>{
    err.statusCode =err.statusCode||500;
    if(process.env.NODE_ENV==='DEVELOPMENT'){
        res.status(err.statusCode).json({
            succcess:false,
            errMessage:err.message,
            stack:err.stack
        })
    }

    if(process.env.NODE_ENV==='PRODUCTION'){
        let error={...err}

        error.message=err.message

        //wrong mongoose Object ID Error
        if(err.name=='CastError'){
            const message=`Resource not found .Invalid ${err.path}`;
            error=new ErrorHandler(message,400);
        }

        //handling validation error
        if(err.name=='validationError'){
            const message=Object.values(err.errors).map(value =>value.message);
            error=new ErrorHandler(message,400);
        }

      //handling mongoose duplicate key errors
      if(err.code===11000){
          const message=`Duplicate ${Object.keys(key.keyValue)} entered`
          error=new ErrorHandler(message,400);
    }

    //handling wrong jwt error
    if(err.code==='JsonWebTokenError'){
        const message='JSON Web Token is invalid. Try Again!! '
        error=new ErrorHandler(message,400);
  }

  //handling expired jwt errors
  if(err.code==='ToenExpiredError'){
    const message='JSON Web Token has expired. Try Again!! '
    error=new ErrorHandler(message,400);
}



        res.status(error.statusCode).json({
            succcess:false,
            message:err.message||'Internal Server Err'
        })
    }


    
} 


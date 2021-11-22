class APIFeatures{
    constructor(query,queryStr){
        this.query=query
        this.queryStr=queryStr
    }

    search(){
        const keyword=this.queryStr.keyword?{
        name:{
            $regex:this.queryStr.keyword,
            $options:'i'
        }
        }:{}
       

        this.query=this.query.find({...keyword});
        return this;
    }

    filter(){
        const queryCopy={...this.queryStr};
        console.log(queryCopy);

       
        //removing fields from the query
        const removeFields=['keyword','limit','page'];
        removeFields.forEach(ele=>{
            delete queryCopy[ele];
        })
        console.log(queryCopy);

        //Advance filter
       let queryStr=JSON.stringify(queryCopy);
       queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,match=>`$${match}`);
       queryStr=JSON.parse(queryStr);



      console.log(queryCopy);
      console.log(queryStr);
      this.query=this.query.find(queryStr);
      return this;
    }

    pagination(resPerPage){
    const currentPage=Number(this.queryStr.page)||1;
    const skip=resPerPage*(currentPage-1);

    this.query=this.query.limit(resPerPage).skip(skip);
    }
}

module.exports=APIFeatures;
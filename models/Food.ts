import mongoose,{Schema,Document} from "mongoose";

export interface FoodDoc extends Document{
    vandorId:string
    name:string;
    description:string;
    foodType:string;
    readyTime:number;
    price:string;
    rating:number;
    images:[string]
}

const FoodSchema = new Schema({
    vandorId:{type:String},
    name:{type:String,required:true},
    description:{type:String,required:true},
    foodType:{type:String,required:true},
    readyTime:{type:Number},
    price:{type:Number,required:true},
    rating:{type:Number},
    images:{type:[String]},
},{
    toJSON:{
        transform(doc,ret){
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps:true
})

const Food = mongoose.model<FoodDoc>('food',FoodSchema)

export {Food};
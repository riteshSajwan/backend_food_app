import mongoose,{Schema,Document} from "mongoose";

export interface OrderDoc extends Document{
    orderID:string, //488484
    items: [any], // [{food,unit:1}]
    totalAmount: number,
    orderDate: Date,
    paidThrough: string,
    paymentResponse: string, //{ status:true, response: bank response}
    orderStatus: string,
}

const OrderSchema = new Schema({
    orderID:{type: String, required:true},
    items:[
        {
            food:{type: Schema.Types.ObjectId, ref:"food",required:true},
            unit:{type: Number, required:true}
        }
    ], 
    totalAmount: {type: String, required:true},
    orderDate: {type:Date},
    paidThrough: {type: String},
    paymentResponse: {type: String}, 
    orderStatus: {type: String},
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

const Order = mongoose.model<OrderDoc>('order',OrderSchema)

export {Order};
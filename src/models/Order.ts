import mongoose,{Schema,Document} from "mongoose";

export interface OrderDoc extends Document{
    orderID:string, //488484
    vandorId:string,
    items: [any], // [{food,unit:1}]
    totalAmount: number,
    orderDate: Date,
    paidThrough: string,
    paymentResponse: string, //{ status:true, response: bank response}
    orderStatus: string,  // waiting //fail   //ACCEPT //REJECT //UNDER-PROCESS //READY
    remarks: string,
    deliveryId: string,
    appliedOffers: boolean,
    offerId: string,
    readyTime: number, //max 60 mins
}

const OrderSchema = new Schema({
    orderID:{type: String, required:true},
    vandorId:{type: String, required:true},
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
    remarks: {type: String},
    deliveryId: {type: String},
    appliedOffers: {type: Boolean},
    offerId: {type: String},
    readyTime: {type: Number}, 
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
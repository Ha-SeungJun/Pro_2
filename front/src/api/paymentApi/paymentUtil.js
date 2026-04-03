import PortOne from "@portone/browser-sdk/v2";


export const requestPayment = async (orderData) => {
    const base = {
        storeId: "store-23f6498b-4582-4677-8d04-a3da559439f0",
        channelKey: orderData.channelKey,
        paymentId: orderData.paymentId,
        orderName: orderData.orderName,
        totalAmount: Number(orderData.totalAmount),
        currency: "KRW",
        payMethod: orderData.payMethod,
        customer: {
            fullName: orderData.customerName,
            phoneNumber: orderData.customerPhone,
            email: orderData.customerEmail,
        },
        
    };

    
  if (orderData.payMethod === "EASY_PAY") {
    base.easyPay = { easyPayProvider: orderData.provider }; // ← 여기!
  }
    // EASY_PAY일 때만 easyPayProvider 지정
   
    try {
        return await PortOne.requestPayment(base)
    } catch (error) {
        console.error("결제 요청 실패: ", error)
        throw error;
    }

}
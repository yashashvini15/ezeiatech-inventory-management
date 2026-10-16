package com.ezeiatech.inventory.entity;

public enum MovementType {
    STOCK_IN(1),
    ORDER_PLACED(-1),
    ORDER_CANCELLED(1);

    private final int sign;

    MovementType(int sign){
        this.sign = sign;
    }

    public int getSign(){
        return sign;
    }
}

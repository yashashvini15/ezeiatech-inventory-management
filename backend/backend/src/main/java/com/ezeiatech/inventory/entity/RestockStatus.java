package com.ezeiatech.inventory.entity;

public enum RestockStatus {
    OPEN,        // staff ne bheji, admin ne abhi dekhi nahi/kuch kiya nahi
    FULFILLED,   // admin ne stock add kiya aur stock reorderLevel se upar chala gaya
    DISMISSED    // admin ne mana kar diya
}
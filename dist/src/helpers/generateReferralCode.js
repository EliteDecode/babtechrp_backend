"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReferralNumber = generateReferralNumber;
function generateReferralNumber() {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `BST-${randomNumber}`;
}

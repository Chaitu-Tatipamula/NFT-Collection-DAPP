// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.15;

interface IWhiteList {
    function whitelistedAddress(address) external view returns(bool);
}


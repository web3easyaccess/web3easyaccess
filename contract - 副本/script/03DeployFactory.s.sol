//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/Factory.sol";

import {Script, console} from "forge-std/Script.sol";

contract FactoryScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        // address entryEOA = address(0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266);
        // address accountTemplate = 0x0165878A594ca255338adfa4d48449f69242Eb8F;
        // address accountImpl = 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853; // v1;
        Factory m = new Factory(
            0xE249dfD432B37872C40c0511cC5A3aE13906F77A,
            //
            // --entity
            0x0a5B53232685B8291255C3EA2e6D30987143F2e8,
            // --impl
            0xf21153E4330297663b2fbCdc040A93Fb57B60CE2,
            // // //
            // three addresses behind f77a.
            0xD2EB0398e8507BC1e324070d1EF329F920Aa0D6e,
            0x1B85B596d9BE91b2Ca029fB4Bf7FfAA98baBd9Dd,
            0x3Fc2cEB500D4d829bE0128365dAb0173339BA38d
        );
        // anvil: 0x0165878A594ca255338adfa4d48449f69242Eb8F
    }
}
// 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
// 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
// 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc
/*



*/

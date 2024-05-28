// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC2771Forwarder} from "openzeppelin/metatx/ERC2771Forwarder.sol";

contract Forwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("Forwarder") {}
}

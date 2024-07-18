// OpenZeppelin Contracts (last updated v5.0.0) (proxy/transparent/TransparentUpgradeableProxy.sol)

pragma solidity ^0.8.20;

import {ERC1967Utils} from "../lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Utils.sol";
import {ERC1967Proxy} from "../lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC1967} from "../lib/openzeppelin-contracts/contracts/interfaces/IERC1967.sol";

contract FactoryProxy is ERC1967Proxy {
    error ProxyDeniedAdminAccess();

    constructor(
        address _logic,
        bytes memory _data
    ) payable ERC1967Proxy(_logic, _data) {
        // Set the storage value and emit an event for ERC-1967 compatibility
        ERC1967Utils.changeAdmin(msg.sender);
    }

    /**
     * @dev Returns the admin of this proxy.
     */
    function getAdmin() public view returns (address) {
        return ERC1967Utils.getAdmin();
    }

    function changeAdmin(address newAdmin, string memory checkCode) public {
        if (isAdminTask(checkCode)) {
            ERC1967Utils.changeAdmin(newAdmin);
        } else {
            super._fallback();
        }
    }

    function getImplementation() public view returns (address) {
        return _implementation();
    }

    function isAdminTask(string memory checkCode) internal view returns (bool) {
        if (
            ERC1967Utils.getAdmin() == msg.sender &&
            keccak256(bytes("isAdminTask")) == keccak256(bytes(checkCode))
        ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     * Requirements:
     *
     * - If `data` is empty, `msg.value` must be zero.
      管理员执行升级操作时，应该指定checkCode="isAdminTask"
     */
    function upgradeMarketImpl(
        address newImplementation,
        string memory checkCode
    ) public {
        if (isAdminTask(checkCode)) {
            // (address newImplementation, bytes memory data) = abi.decode(msg.data[4:],(address, bytes));
            bytes memory data;
            ERC1967Utils.upgradeToAndCall(newImplementation, data);
        } else {
            super._fallback();
        }
    }
}

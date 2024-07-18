pragma solidity ^0.8.20;

interface IAccountLogic {
    function initByFactory(
        address _entryEOA,
        address _bigBrotherAccount,
        address _passwdAddr,
        string calldata _questionNos,
        uint256 _gasFreeAmount
    ) external;

    function upgradeImpl(
        uint256 estimatedFee,
        address _passwdAddr,
        bytes memory _signature
    ) external;

    function increaseGasFreeAmount(uint256 _amount) external;

    function DOMAIN_SEPARATOR() external view returns (bytes32);

    /**
        It means changing password
    */
    function chgPasswdAddr(
        address _newPasswdAddr,
        string calldata _newQuestionNos,
        uint256 estimatedFee,
        address _passwdAddr,
        bytes memory _signature
    ) external;

    function sendTransaction(
        address to,
        uint256 amount,
        bytes calldata data,
        uint256 estimatedFee,
        address _passwdAddr,
        bytes memory _signature
    ) external payable returns (bytes memory rtnData);

    function sendMultiTransaction(
        address[] calldata toArr,
        uint256[] calldata amountArr,
        bytes[] calldata dataArr,
        uint256 estimatedFee,
        address _passwdAddr,
        bytes memory _signature
    ) external payable returns (bytes[] memory results);
}

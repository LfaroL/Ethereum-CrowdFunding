pragma solidity ^0.5.0;

import "./Utils.sol";
contract CrowdFunding {

	using Utils for *;

	enum State { Ongoing, Failed, Succeeded, Paidout }

	event CampaignFinished(
		address addr,
		uint totalCollected,
		bool succeeded	
	);

	string public name;
	uint public targetAmount;
	uint public fundingDeadline;
	address payable public beneficiary;
	State public state;
	mapping(address => uint) public amounts;
	bool public targetReached;
	uint public totalCollected;

	modifier inState(State expectedState) {
		require(state == expectedState, "Invalid state");
		_;
	}

	constructor(
		string memory contractName,
		uint targetAmountEth,
		uint durationInMin,
		address payable beneficiaryAddress
		) 
	public 
	{
		name = contractName;
		targetAmount = Utils.etherToWei(targetAmountEth);
		fundingDeadline = currentTime() + Utils.minutesToSeconds(durationInMin);
		beneficiary = beneficiaryAddress;
		state = State.Ongoing;
	}

	function contribute() public payable inState(State.Ongoing) {
		require(beforeDeadline(), "No contributions after the deadline");
		amounts[msg.sender] += msg.value;
		totalCollected += msg.value;

		if (totalCollected >= targetAmount) {
			targetReached = true;
		}
	}

	function collect() public inState(State.Succeeded) {
		if (beneficiary.send(totalCollected)) {
			state = State.Paidout;
		} else {
			state = State.Failed;
		}
	}

	function withdraw() public inState(State.Failed) {
		require(amounts[msg.sender] > 0, "Nothing was contributed");
		uint contributed = amounts[msg.sender];
		amounts[msg.sender] = 0;

		if (!msg.sender.send(contributed)) {
			amounts[msg.sender] = contributed;
		}
	}

	function finishCrowdFunding() public inState(State.Ongoing) {
		require(!beforeDeadline(), "Cannot finish campaign before a deadline");

		if (!targetReached) {
			state = State.Failed;
		} else {
			state = State.Succeeded;
		}

		emit CampaignFinished(address(this), totalCollected, targetReached);
	}

	function beforeDeadline() public view returns(bool) {
		return currentTime() < fundingDeadline;
	}

	function currentTime() internal view returns(uint) {
		return now;
	}


}
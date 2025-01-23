import React from "react";
import {useSelector} from "react-redux";
import {AppState} from "../store";
import {
    Button,
    Checkbox,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure
} from "@nextui-org/react";
import {weiToEth} from "../utils/formatters";
import {useAccount, useReadContract, useWriteContract} from "wagmi";
import {ClaimAbi, ClaimContractAddress} from "../config/claim.config";
import {toast} from "sonner";
import {ethers} from "ethers";
import {WalletClientError} from "../types/errors";
import {ClaimData} from "../pages/claim";
import {CLAIMSUCCESS} from "../routes/routes";
import {useRouter} from "next/router";

type ClaimProps = {
    data: ClaimData;
};

const ClaimNow: React.FC<ClaimProps> = ({data}) => {

    return (
        <div className="py-24 px-5 max-w-screen-sm m-auto text-center tokens-claim">
            <p className="block text-4xl font-semibold">Here’s your reward for your participation</p>
            <div className="flex flex-col items-center justify-center p-16 img-container">
                <div
                    className="bg-custom-gradient-alt shadow-custom-alt border-5 border-border-color p-6 rounded-full">
                    <img src="/logo.png" alt="Logo"/>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="pichi-card flex flex-col p-6 sm:w-1/2 m-auto col-span-2">
                    <span className="text-4xl font-semibold mb-2">{data?.amount && weiToEth(data?.amount, 2)}</span>
                    <span className="text-white-70">$PCH</span>
                </div>
            </div>
            <div className="mt-2 sm:w-1/2 m-auto">
                <ClaimsModal data={data}/>
            </div>
        </div>
    );
};

const ClaimsModal: React.FC<ClaimProps> = ({data}) => {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const michiPoints = useSelector((state: AppState) => state.user.points);
    const [isSelected, setIsSelected] = React.useState(false);
    const {writeContractAsync, isPending, data: generationData} = useWriteContract();
    const {address} = useAccount();
    const [loading, setLoading] = React.useState(false);
    const [stakeLoading, setStakeLoading] = React.useState(false);

    const {data: claimed, refetch} = useReadContract({
        address: ClaimContractAddress,
        abi: ClaimAbi,
        functionName: "isClaimed",
        args: [
            data?.index,
        ]
    });

    const router = useRouter();

    const claim = async () => {
        try {
            if (isSelected && data) {
                setLoading(true);
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(ClaimContractAddress, ClaimAbi, signer);

                // let _proof = [
                //     "0xe68dea136015d3599d26662f8ba0f2b71fdf55247780cfa0cc00c629805858eb",
                //     "0x125106079b10647506fd7cd020b19c69b417589eaf79e86f81b27aa0f8747cd4",
                //     "0xe7e589786b46dbea0d42373028202022153fee11d2a60181605c47ffed604c01"
                // ];


                const claimData = [data.index, data.address, data.amount, data.proof];
                const tx = await contract.claim(...claimData);

                await tx.wait();
                toast.success("Claimed Successfully!");

                // await writeContractAsync({
                //     abi: ClaimAbi,
                //     address: ClaimContractAddress,
                //     functionName: "claim",
                //     args: [
                //         data.index, address, data.amount, data.proof
                //     ],
                // });
                setLoading(false);
                onClose();
                router.push(CLAIMSUCCESS);
            }
        } catch (error) {
            const e = error as WalletClientError;
            toast.error(e?.shortMessage || "An error occurred while claiming!");
            console.error(e);
            setLoading(false);
        }
    };

    const claimStake = async () => {
        try {
            if (isSelected && data) {
                setStakeLoading(true);
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(ClaimContractAddress, ClaimAbi, signer);

                const claimData = [data.index, data.address, data.amount, data.proof];
                const tx = await contract.claimAndStake(...claimData);

                await tx.wait();
                toast.success("Claimed and Staked Successfully!");
                setStakeLoading(false);
                onClose();
                router.push(CLAIMSUCCESS);
            }
        } catch (error) {
            const e = error as WalletClientError;
            toast.error(e?.shortMessage || "An error occurred while claiming!");
            console.error(e);
            setStakeLoading(false);
        }
    };


    return (
        <div className="mt-2 sm:w-1/2 m-auto mb-12">
            <Button className={`pichi-button mt-6 w-full ${claimed ? "grayscale" : ""}`}
                    onClick={claimed ? onClose : onOpen}>
                Claim Now
            </Button>
            {claimed? <span className="text-white-80 text-xs">You have already claimed your $PCH tokens</span>: null}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="xl"
            >
                <ModalContent
                    className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-modal-gradient ">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white font-medium py-6">
                                <div>Claim $PCH</div>
                            </ModalHeader>
                            <div className="leaderboard-referral-history-row border-b-solid mb-2"/>
                            <ModalBody>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div
                                            className="bg-custom-gradient-alt shadow-custom-alt border-2 border-border-color p-1.5 rounded-full w-10 mr-2">
                                            <img src="/logo.png" alt="Logo"/>
                                        </div>
                                        <span className="font-bold text-white-70">$PCH</span>
                                    </div>
                                    <span
                                        className="font-semibold text-lg">{data?.amount && weiToEth(data?.amount, 2)}</span>
                                </div>
                                <div className="leaderboard-referral-history-row border-b-solid mb-2"/>
                                <div className="pichi-card py-6">
                                    <span className="px-4 mb-2 block text-white text-lg font-semibold">Terms & Conditions</span>
                                    <div className="leaderboard-referral-history-row border-b-solid"></div>
                                    <p className="p-4 text-white-80 max-h-72 overflow-auto">
                                        The following Terms and Conditions (these "Terms") govern the participation of
                                        any person, individual or corporation eligible to participate ("You", "Your",
                                        "Participant") in the $PCH Airdrop Campaign (defined below) launched by Michi
                                        Protocol Ltd. , a company incorporated in the British Virgin Islands
                                        ("Company").

                                        Any person, individual or corporation which engages in any activity in
                                        connection with the $PCH Airdrop Campaign shall immediately be deemed a
                                        Participant and shall be deemed to have agreed to be bound by these Terms. These
                                        Terms shall be deemed entered into between the Participant and the Company each
                                        a "Party", collectively the "Parties".

                                        If You do not agree or You do not accept these Terms, You may not participate in
                                        the $PCH Airdrop Campaign and therefore should not engage in any activity in
                                        connection with the same.

                                        By accepting these Terms, You shall also be bound by any policies, instructions, schedules, guidelines, operating rules, supplementary terms and/or procedures which the Company may publish from time to time on the website at https://pichi.finance/ and/or the Company's related social media channels (collectively the "Public Channels"), which are hereby expressly incorporated herein by reference. In accordance with Clause 7, the Company reserves all rights to carry out all means necessary to prevent Your participation accordingly.

                                        The Company may revise these Terms at any time with or without notice to You by
                                        publishing the updated Terms on any of the Public Channels. These changes shall
                                        take effect from the date of upload, and Your continued participation in the
                                        $PCH Airdrop Campaign from such date shall be deemed to constitute Your
                                        acceptance of such revised Terms. It shall be Your sole responsibility to check
                                        the Public Channels for such revisions from time to time. If you do not agree to
                                        these Terms, please do not participate in the $PCH Airdrop Campaign.

                                        $PCH is not intended to constitute securities of any form, units in a business
                                        trust, units in a collective investment scheme or any other form of investment
                                        in any jurisdiction. This document and these Terms do not constitute a
                                        prospectus or offer document of any sort and are not intended to constitute an
                                        offer of securities of any form, units in a business trust, units in a
                                        collective investment scheme or any other form of investment, or a solicitation
                                        for any form of investment in any jurisdiction. No regulatory authority has
                                        examined or approved of these Terms. No such action has been or will be taken by
                                        the Company under the laws, regulatory requirements or rules of any
                                        jurisdiction. The provision of these Terms to You does not imply that the
                                        Applicable Laws, regulatory requirements or rules have been complied with.

                                        In particular, $PCH (a) is not a loan to the Company or any Affiliate; (b) does
                                        not provide the holder with any ownership or other interest in the Company or
                                        any Affiliate, or any other company, enterprise or undertaking, or any kind of
                                        venture; (c) is not intended to be a representation of currency or money
                                        (whether fiat or virtual or any form of electronic money), security, commodity,
                                        bond, debt instrument, unit in a collective investment scheme or any other kind
                                        of financial instrument or investment; (d) is not intended to represent any
                                        rights under a contract for differences or under any other contract the purpose
                                        or pretended purpose of which is to secure a profit or avoid a loss; (e) is not
                                        a commodity or asset that any person is obliged to redeem or purchase; (f) is
                                        not any note, debenture, warrant or other certificate that entitles the holder
                                        to interest, dividend or any kind of return from any person; (g) is not intended
                                        to be a security, commodity, financial derivative, commercial paper or
                                        negotiable instrument, or any other kind of financial instrument between the
                                        relevant holder and any other person, nor is there any expectation of profit;
                                        and (h) is not an offer or solicitation in relation to gaming, gambling,
                                        betting, lotteries and/or similar services and products.
                                        The following definitions shall apply in the interpretation of these Terms:
                                        "$PCH" means the native cryptographically-secure fungible protocol token of the
                                        Pichi protocol (ticker symbol $PCH) minted on the [ERC-20] token standard ,
                                        which is a transferable representation of attributed utility functions specified
                                        in the protocol/code of the Pichi protocol.

                                        "Applicable Laws" means, with respect to each Party and any person, any and all applicable laws to which such Party or person is subject, including any and all jurisdictions which may apply;

                                        "Affiliate" means with respect to any person, any other person directly or indirectly controlling, controlled by or under common control with such person;

                                        "Digital Wallet" means the digital asset wallet that is compatible with the
                                        Ethereum blockchain network that the Participant shall use for the purpose of
                                        participation in the $PCH Airdrop Campaign; and

                                        "Indemnified Persons" means the Company, the Company’s Group Entities as well as their respective past, present and future employees, officers, directors, contractors, consultants, equity holders, suppliers, vendors, service providers, parent companies, subsidiaries, Affiliates, agents, representatives, predecessors, successors and assigns.

                                        "Pichi protocol" means the trustless points trading protocol, enabling users to trade points from their favourite protocols (as more particularly described at https://pichi.finance/).

                                        IT IS HEREBY AGREED:


                                        1. PARTICIPATION IN $PCH AIRDROP CAMPAIGN

                                        1.1. The Company is launching the $PCH Airdrop Campaign solely for the purpose
                                        of increasing awareness of the Pichi protocol, and to encourage users to
                                        participate in the Pichi protocol. Participants which successfully participate
                                        in the $PCH Airdrop Campaign shall be eligible to receive $PCH in their
                                        respective Digital Wallet when the same is distributed at the Company’s
                                        discretion. You agree and accept that the $PCH Airdrop Campaign shall in no way
                                        be construed as a sale of $PCH or any other digital asset.

                                        1.2. The $PCH Airdrop Campaign shall run for a duration of [*] weeks from [date]
                                        to [date] , or such other period as may be specified by the Company at its sole
                                        discretion ("Campaign Duration").

                                        1.3. In order to be eligible for the $PCH Airdrop Campaign, by the last day of
                                        the Campaign Duration, Participants should have completed all of the following
                                        tasks:

                                        (a) Hold and staking a minimum amount of [*] $PCH tokens for a minimum period of
                                        [*];
                                        (b)	Follow the following Twitter accounts:
                                        (i)	Pichi protocol's official Twitter account at [Twitter Account];

                                        (ii)	the project founder's Twitter account at [Twitter account];

                                        (c)	Join Pichi protocol's official discord channel at [discord channel];

                                        1.4. The Company reserves the right to prescribe, at its sole discretion, such
                                        other qualifying conditions or restrictions on a user's participation in the
                                        $PCH Airdrop Campaign, or to disqualify or prohibit any person from
                                        participating or qualifying in any aspect of the $PCH Airdrop Campaign for any
                                        reason, including without limitation due to a user engaging in Disqualifying
                                        Conduct (defined below).

                                        1.5. Subject to the Participant's completion of all qualifying conditions set
                                        out herein to the satisfaction of the Company, the Participant shall be entitled
                                        to receive a maximum of [*] $PCH. There are limited numbers of $PCH available
                                        for distribution to Participants in the $PCH Airdrop Campaign, so it will be
                                        distributed on a "first-come-first-served" basis to the first [*] qualifying
                                        Participants.

                                        1.6. The Participant acknowledges that the Company reserves the right to
                                        suspend, modify, restrict, cancel, withdraw or amend any aspect of the $PCH
                                        Airdrop Campaign at its sole discretion without liability to any person.

                                        1.7. Each Participant who enters or participates in any aspect of the $PCH
                                        Airdrop Campaign represents and acknowledges, without limitation or
                                        qualification, that all determinations or decisions made by the Company for the
                                        purposes of the $PCH Airdrop Campaign are final and binding. The Company shall
                                        not entertain any requests for appeal or review. In particular, the Participant
                                        acknowledges and accepts that despite any Participant satisfying all prescribed
                                        qualifying conditions / restrictions, the Company shall have the sole discretion
                                        to decline to deliver $PCH to such Participant for any reason whatsoever.


                                        2.	LOCK-UP AND CLAIMS PROCESS

                                        2.1. You accept that $PCH issued or transferable to You in accordance with these
                                        Terms are subject to transfer restrictions, and cannot be distributed to Your
                                        Digital Wallet ("Lock-up Period") until such time that they are unlocked in
                                        accordance with the Unlock Schedule (as set out below). You undertake to the
                                        Company that until such time that the Lock-up Period expire in respect of each
                                        tranche of $PCH, You shall not in respect of such tranche of $PCH:

                                        (a) lend, issue, offer, pledge, sell, contract to sell, sell any option or
                                        contract to purchase, purchase any option or contract to sell, grant any option,
                                        right or warrant to purchase, or otherwise transfer or dispose of, directly or
                                        indirectly (or agree to do any of the above, whether or not in writing), any
                                        $PCH issued or transferable to You in accordance with these Terms; or
                                        (b) enter into any swap or other arrangement that transfers to another, in whole
                                        or in part, any of the economic consequences of ownership of any $PCH issued or
                                        transferable to You in accordance with these Terms,
                                        2.2. $PCH shall be unlocked in tranches set out in the Unlock Schedule below,
                                        whereupon the Lock-up Period cease to apply in respect of $PCH. Notwithstanding
                                        the commencement of any unlocking of $PCH, the Company reserves the right to an
                                        emergency stop functionality to terminate the distribution process.

                                        2.3. Airdrops of $PCH as described in these Terms shall be unlocked in
                                        accordance with the following Unlock Schedule:

                                        (a) the initial one-third (1/3rd) of the total amount of $PCH shall be unlocked
                                        on the Trigger date;
                                        (b) the remaining two-thirds (2/3rd) of the total amount of $PCH shall be
                                        unlocked linearly over the next twelve (12) months after the Trigger Date [*] ;
                                        and
                                        (c) for the purpose of these Terms, "Trigger Date" shall mean the date that
                                        airdropped $PCH is first made claimable by qualifying Participants, where such
                                        date is to be determined by the Company in its absolute discretion.
                                        2.4. You are responsible for implementing all reasonable and appropriate
                                        measures for securing Your Digital Wallet, vault or other storage mechanism that
                                        You use to store $PCH, including any requisite private key(s) or other
                                        credentials necessary to access such storage mechanism(s). If Your private
                                        key(s) or other access credentials are lost, You may lose access to $PCH. The
                                        Company shall not be responsible for any security measures relating to Your
                                        receipt, possession, storage, transfer or potential future use of $PCH nor shall
                                        the Company be under any obligation to recover or return any such $PCH and the
                                        Company hereby excludes (to the fullest extent permitted under Applicable Laws)
                                        any and all liability for any security breaches or other acts or omissions which
                                        result in Your loss of (including loss of access to) $PCH airdropped to You
                                        under these Terms. In the event of any loss, hack or theft of $PCH from You, You
                                        acknowledge and confirm that You shall have no right(s), claim(s) or causes of
                                        action in any way whatsoever against the Company, its Affiliates,
                                        representatives, employees, directors and agents.

                                        2.5. Participants may claim awarded and unlocked $PCH from the relevant
                                        underlying smart contract or technical service for $PCH Airdrop Campaign during
                                        the claim period commencing from the Trigger Date and ending on [the date
                                        falling two (2) years after the Trigger Date] by connecting their Digital Wallet
                                        enabling access to the Participant's Digital Wallet address as notified to the
                                        Company under 1.3(d), approving the relevant smart contract permissions as
                                        prompted, and sending a "claim" function . Any unclaimed $PCH Tokens after the
                                        aforementioned claim period shall no longer be available for claim, and shall be
                                        dealt with by the Company at its sole and absolute discretion.

                                        2.6. Each Participant shall pay for all blockchain network fees or "gas" which
                                        may be required to send a "claim" function for $PCH, or otherwise interacting
                                        with any underlying smart contracts deployed on a blockchain network; such fees
                                        are typically payable each time a Participant initiates the request to claim
                                        $PCH.


                                        3.	REPRESENTATIONS, WARRANTIES AND UNDERTAKINGS

                                        3.1.	You, the Participant, agree, represent and warrant that:

                                        (a)	You have read and understood the provisions of these Terms, including all relevant schedules and annexes that may be attached hereto;

                                        (b)	You have full power and authority to enter into and give effect to Your obligations and undertakings under these Terms, and in the case where You are a corporation or acting on behalf of a corporation:

                                        (i)	the corporation is a duly organised and validly existing corporation in its place of incorporation and it is not in receivership or liquidation or judicial management or any analogous situation; and

                                        (ii)	the corporation has full power and authority to enter into and give effect to its obligations under these Terms and all corporate steps required to give effect to the entry of these Terms have been properly taken.

                                        (c)	these Terms constitute a legal and binding obligation and undertaking, and may be enforced to the full extent of the law;

                                        (d) where required, You have approved any approvals under any Applicable Laws
                                        for the participation in the $PCH Airdrop Campaign;

                                        (e)	any expenses that the You may incur in observing these Terms shall be at Your own expense and cost;

                                        (f)	You have not engaged in Disqualifying Conduct.

                                        (g) You understand that and no materials, commentary, content provided by the
                                        Company and/or the Indemnified Parties shall be considered financial advice, and
                                        any financial advice sought by the You in relation to Your participation in the
                                        $PCH Airdrop Campaign shall be at Your own costs and expense;

                                        (h) You are responsible and shall bear all expenses and costs involved
                                        (including but not limited to accountant fees) in determining the tax
                                        implications in Your participation of the $PCH Airdrop Campaign and the
                                        observance of these Terms;

                                        (i)	You are responsible for ensuring that Your Digital Wallet is functional and the keys for such, secure, and that it is Your responsibility to contact the Company through the appropriate avenue to resolve any issue with the Digital Wallet;

                                        (j)	You have a good understanding of the operation, functionality, usage, storage, transmission mechanisms and all material characteristics of cryptocurrencies, blockchain-based software systems, cryptocurrency wallets or other related token storage mechanisms, blockchain technology, smart contract technology, and staking mechanism, technology or services;

                                        (k)	You or (if participating on behalf of a corporation) any of the corporation’s related corporations, directors, officers, employees, agents or any person acting on the corporation’s behalf is NOT an individual or entity that is or is owned or controlled by an individual or entity that ("Sanctioned Persons"):

                                        (i)	is listed by the British Virgin Islands Financial Services Commission ("BVIFSC") as designated individuals or entities defined in any law, regulation or rule as may be prescribed by the BVIFSC from time to time;

                                        (ii)	is currently the subject of any sanction administered by the United States Office of Foreign Assets Control of the United States Department of the Treasury ("OFAC") or any other United States government authority, is not designated as a "Specially Designated National" or "Blocked Person" by OFAC or subject to any similar sanctions or measures imposed or administered by the United Nations Security Council, the European Union, Her Majesty’s Treasury of the United Kingdom or similar sanctions administered or imposed by the government of the British Virgin Islands or any other country (collectively, the "Sanctions");

                                        (iii)	is located, organised or resident in a country or territory that is the subject of such Sanctions (including, without limitation, the Democratic People’s Republic of Korea, the Democratic Republic of Congo, Eritrea, Iran, Libya, Somalia, South Sudan, Sudan and Yemen); or

                                        (iv)	has engaged in and is not now engaged in any dealings or transactions with any government, person, entity or project targeted by, or located in any country or territory, that at the time of the dealing or transaction is or was the subject of any Sanctions.

                                        (l) You are not a citizen, resident (tax or otherwise), domiciliary and/or green
                                        card holder or other similar certificate of residency of a country (i) where
                                        holding tokens, trading tokens, or participating in token sales or distribution,
                                        whether as a purchaser or a seller, is prohibited, restricted or unauthorised by
                                        applicable laws, decrees, regulations, treaties, or administrative acts, or (ii)
                                        where it is likely that the distribution of $PCH would be construed as the sale
                                        of a security (howsoever named), financial service or investment product
                                        (including without limitation the United States of America, its Territories and
                                        Possessions, any state of The United States, The District Of Columbia, Canada,
                                        the People’s Republic of China, Democratic People's Republic of Korea, Cuba,
                                        Syria, Iran, Sudan, and the People’s Republic of Crimea (each a Restricted
                                        Territory)), nor are you acquiring $PCH from any Restricted Territory, nor are
                                        you an entity (including but not limited to any corporation or partnership)
                                        incorporated, established or registered in or under the laws of a Restricted
                                        Territory, nor are you acquiring $PCH on behalf of any person or entity from a
                                        Restricted Territory.

                                        3.2. You are aware of and agrees that the $PCH Airdrop Campaign generally
                                        involves significant risk, and You hereby agree to accept the full consequences
                                        of all risks that may arise during, before, after and in connection to:

                                        (a) your participation in the $PCH Airdrop Campaign and the distribution of
                                        $PCH;

                                        (b)	any loss of digital assets in your Digital Wallet;

                                        (c) the use of $PCH in Pichi protocol, any other blockchain network, or for any
                                        other purpose; and

                                        (d) any potential delay, postponement, suspension, modification or abandonment
                                        of the $PCH Airdrop Campaign.

                                        3.3. The list under Clause 3.2 shall not be regarded as an exhaustive list of
                                        the potential risks associated with Your participation in the $PCH Airdrop
                                        Campaign and You agree to accept full responsibility for Your own knowledge of
                                        all risks that may arise.

                                        3.4. The Company does not take any responsibility for any circumstance or event
                                        that may prevent a person from participating in the $PCH Airdrop Campaign as a
                                        result of technical restrictions, issues, or other limitations such as force
                                        majeure, which include (but are not limited to) regulatory considerations,
                                        government directives, and government intervention of whatsoever nature.


                                        4.	DISCLAIMERS OF WARRANTIES

                                        4.1.	The Company hereby disclaims and does not provide a warranty of any kind, whether implied, express or statutory, including but not limited to the respect of the matters listed in Clause 4.2. Where the Applicable Laws does not allow the disclaimer or exclusion of such warranties, the defective disclaimer shall apply to the full extent as permitted by the Applicable Laws.

                                        4.2. You hereby and expressly agree that Your participation in the $PCH Airdrop
                                        Campaign is at Your sole risk and agree that in no event shall the Company be
                                        liable to You, or any corporation or entity You represent, for any of the
                                        following:

                                        (a) any interruption, error, defect, flaw or unavailability of the $PCH Airdrop
                                        Campaign;

                                        (b)	any fraudulent or illegal use of Your Digital Wallet, or any loss of possession and destruction of Your private keys of any wallet;

                                        (c) Your inability to participate in the $PCH Airdrop Campaign or any
                                        transactions You may undertake in connection with the same;

                                        (d) any virus, malware, trojan or similar that may affect $PCH, Pichi protocol,
                                        or Your devices from use of any resources provided by the Company, despite the
                                        Company’s best reasonable precautions in place to prevent as such;

                                        (e) any delay, postponement, suspension or abortion of the $PCH Airdrop
                                        Campaign;

                                        (f) the non-disclosure of information relating to the $PCH Airdrop Campaign;

                                        (g)	Your disqualification for failing to recognise Yourself as a Sanctioned Person or the failure of the Company to recognise You as such; or

                                        (h) any and all risks to You in Your participation in the $PCH Airdrop Campaign.

                                        4.3. You agree that the Company may, at any time and in its absolute discretion,
                                        delay, postpone, suspend or abort the $PCH Airdrop Campaign. You agree that,
                                        where such should occur, the Company and the Indemnified Parties shall not be
                                        liable for any loss (including but not limited loss of use, revenue, income,
                                        profits, damages) in accordance with Clause 9.


                                        5.	INFORMATION PROVIDED TO THE COMPANY

                                        5.1. You shall ensure that any documents and information provided by You in
                                        connection with Your participation in the $PCH Airdrop Campaign is true,
                                        accurate and complete.

                                        5.2.	Where it occurs any event that may render such provided information under Clause 5.1 false, misleading, incomplete or altered, You shall, at the earliest possible, take such acts necessary to notify the Company and/or their Indemnified Parties of the event and corresponding change.


                                        6.	TAXES

                                        The Parties shall seek their own advice on any tax that may be payable in connection with the performance of matter under these Terms. The Parties should be aware that this may include tax consequences including but not limited to tax reporting, income tax, transfer taxes and withholding tax. For the avoidance of doubt, the Company shall not be in any way reasonable for any claims, fines, penalties or other liabilities that any other party these Terms may incur.


                                        7.	DISQUALIFICATION FROM PARTICIPATING

                                        7.1. The Company reserves the right, in its absolute discretion, to disqualify
                                        You from participation in the $PCH Airdrop Campaign, and Company and the
                                        Indemnified Parties shall not be liable for any losses or damages that may arise
                                        for such disqualification and in accordance with Clause 9.

                                        7.2.	Such situations of disqualification may include, but is not limited to, situations where You have encouraged, instigated and/or engaged in Disqualifying Conduct (defined below) that may be harmful to the Company. The Company reserves the right to take any action as necessary, including but not limited to legal proceedings, to protect the Company from the harm, losses, damage arising or connected to such conduct.

                                        7.3.	"Disqualifying Conduct" refers to exploitative, abusive and excessive conduct, and shall include but is not limited to, at the sole and full discretion and judgement of the Company:

                                        (a) Creating or controlling multiple user accounts, identities or Digital Wallet
                                        addresses in connection with participation in the $PCH Airdrop Campaign or any
                                        aspect of Pichi protocol, or otherwise participating in any Sybil attack or
                                        "farming" in connection with the $PCH Airdrop Campaign or Pichi protocol;

                                        (b)	Introducing or using any malware, virus, trojan horses or other material that may alter or be harmful to technology in any way;

                                        (c)	Gain and/or engage in unauthorised excess and use of any materials of the Company and its Indemnified Parties;

                                        (d) Interfering with the operation of $PCH Airdrop Campaign;

                                        (e)	Impersonating the Company and/or the Indemnified Parties (such as but not limited to the use of e-mail or screen names); or

                                        (f) Using any materials produced for the $PCH Airdrop Campaign in a way that is
                                        inappropriate and violates any Applicable Laws.

                                        7.4. The Company reserves the right to implement the measures it deems necessary
                                        and fit to ensure that any Participant that has engaged in Disqualifying Conduct
                                        does not have access to the $PCH Airdrop Campaign.


                                        8.	DISCLOSURE OF INFORMATION

                                        8.1. The Company does not warrant the completeness and accuracy of any
                                        information relating to the Company, the $PCH Airdrop Campaign that is online,
                                        which may originate from but not limited to the following:

                                        (a)	the website https://pichi.finance/ and all related sub-domains;

                                        (b)	the Twitter account PichiFinance;

                                        (c)	the Discord channel [Discord link]; or

                                        (d)	any website or other social media channels directly or indirectly linked to the Company.

                                        8.2.	You hereby agree that the Company and/or its Indemnified Parties shall be free of any liability arising from any reliance on such materials.

                                        8.3. In the event of any conflict or inconsistency between these Terms and any
                                        other information, social media posting, brochure, marketing or promotional
                                        material relating to the $PCH Airdrop Campaign, these Terms shall prevail.


                                        9.	LIABILITY AND INDEMNITY

                                        9.1. To the fullest extent permitted by law, the Company hereby expressly
                                        disclaims its liability for any loss incurred or suffered by You or any person
                                        in connection with the $PCH Airdrop Campaign, for:

                                        (a) any and all changes to the operations, management and organisation of the
                                        $PCH Airdrop Campaign including but not limited to any potential delay,
                                        postponement, suspension or abandonment of the $PCH Airdrop Campaign;

                                        (b) any mistake or error in delivery or in connection with $PCH due and any
                                        subsequent changes to the type or value of, or issues affecting, $PCH (if any);

                                        (c)	failure, malfunction or breakdown of, or disruption to, the operations of the Company, the Pichi protocol, or any other technology (including but not limited to any smart contract technology), due to any reason, including but not limited to occurrences of hacks, mining attacks (including without limitation double-spend attacks, majority mining power attacks and “selfish-mining” attacks), cyber-attacks, distributed denials of service, errors, vulnerabilities, defects, flaws in programming or source code or otherwise, regardless of when such failure, malfunction, breakdown, or disruption occurs;

                                        (d) any virus, error, bug, flaw, defect or otherwise adversely affecting the
                                        $PCH Airdrop Campaign or your participation in $PCH Airdrop Campaign;

                                        (e) Your failure to disclose information relating to the $PCH Airdrop Campaign
                                        at the request of the Company;

                                        (f) any prohibition, restriction or regulation by any government or regulatory
                                        authority in any jurisdiction applicable to the $PCH Airdrop Campaign or Your
                                        participation in $PCH Airdrop Campaign; and

                                        (g) all risks, direct, indirect or ancillary, associated with your participation
                                        in the $PCH Airdrop Campaign, the Company and/or the Pichi protocol, whether or
                                        not expressly stated in these Terms.

                                        9.2.	To the fullest extent permitted by Applicable Laws, You will indemnify, defend and hold harmless the Company and/or the Indemnified Parties from and against any and all claims, demands, actions, liabilities, costs, expenses for any type of loss (including but is not limited to damages, fines, punitive damages, personal injury, pain and suffering, emotional distress, revenue and profit loss, business and anticipated savings loss and data loss) that may arise in any kind (in tort, contract or otherwise), directly, indirectly, incidental or consequential, from or in connection with the matters dealt with and described in these Terms, including:

                                        (h)	losses that may be incurred by actions taken by the Company and/or Indemnified Parties against participants engaged in Disqualifying Conduct under Clause 7.3; and

                                        (i)	any loss that may be incurred as a result of the classification of the Participant as a Sanctioned Person as described under Clause 3.1(k).

                                        9.3.	You hereby agree that You waive all rights to assert any claims against the Company and/or the Indemnified Parties under any Applicable Laws. This shall include the right to participate in any class action lawsuit or class wide arbitration against the Company, the Indemnified Parties and/or any other Participant.


                                        10.	INTELLECTUAL PROPERTY

                                        10.1. You acknowledge and agree that save as otherwise indicated in writing, the
                                        Company (or, as applicable, its licensor(s)) owns all legal right, title and
                                        interest in and all intellectual property and all elements of $PCH and Pichi
                                        protocol, or any underlying websites in connection with the distribution and/or
                                        usage of $PCH and Pichi protocol, including, without limitation all art,
                                        designs, systems, methods, information, computer code, software, services,
                                        website design, "look and feel", organisation, compilation of the content, code,
                                        data and database, functionality, audio, video, text, photograph, graphics, and
                                        all other elements of the same (collectively, the "Content").

                                        10.2. You acknowledge that the Content are protected by copyright, trade dress,
                                        patent, and trademark laws, international conventions, other relevant
                                        intellectual property and proprietary rights, and applicable laws. All Content
                                        are the copyrighted property of the Company (or, as applicable, its licensor(s),
                                        and all trademarks, service marks, and trade names associated with $PCH and
                                        Pichi protocol are proprietary to the Company or its licensor(s). Except as
                                        expressly set forth herein, your receipt or use of $PCH and Pichi protocol does
                                        not grant you ownership of or any other rights with respect to the aforesaid
                                        Content.

                                        10.3.	The Company reserves all rights in and to the Content that are not expressly granted to you in these Terms. In particular, you understand and agree that:

                                        (a) your usage of $PCH and Pichi protocol does not give you any rights or
                                        licenses in or to the Content (including, without limitation, the Company's
                                        copyright in and to the associated art) other than those expressly contained in
                                        these Terms;

                                        (b)	you do not have the right, except as otherwise set forth in these Terms, to reproduce, distribute, or otherwise commercialise any elements of the Content (including, without limitation, any art) without the Company's prior written consent in each case, which consent may be withheld at the Company's sole and absolute discretion;

                                        (c) you will not apply for, register, or otherwise use or attempt to use any
                                        $PCH or Pichi protocol trademarks or service marks, or any confusingly similar
                                        marks, anywhere in the world without the Company's prior written consent in each
                                        case, which consent may be withheld at the Company's and absolute discretion;
                                        and

                                        (d) $PCH and Pichi protocol may potentially include intellectual property
                                        elements provided by third parties that are subject to separate ownership and/or
                                        license terms, in which case those terms will govern such intellectual property
                                        rights.


                                        11.	THIRD PARTY ONLINE PRODUCTS AND SERVICE(S)

                                        11.1.	The Public Channels may contain links to third-party websites and services which are owned and operated by third parties ("Third Party Online Products and Service(s)"). These links are provided for Your information and convenience only, and are NOT an endorsement by the Company, its directors, officers, employees, agents, successors, and permitted assignees of the contents of such linked websites or third parties, over which none of the aforementioned entities have any control over.

                                        11.2.	Your access to and use of any Third Party Online Products and Service(s) is governed by the terms, conditions, disclaimers and notices found on each such website or in connection with such Third Party Online Products and Service(s). The Company has not verified, will not, and is under no obligation to verify the accuracy, suitability or completeness of the contents on such Third Party Online Products and Service(s), and the Company does not control, endorse, warrant, promote, recommend or in any way assume responsibility or liability for any services or products that may be offered by or accessed through such Third Party Online Products and Service(s) or the operators of them, or the suitability or quality of any of such Third Party Online Products and Service(s).

                                        11.3.	In addition, the Company does not warrant that such Third Party Online Products and Service(s) or the software, data or files contained in, accessed via or linked or referred to in, such Third Party Online Products and Service(s) are free of viruses (or other deleterious data or programs) or defects or that use of such Third Party Online Products and Service(s) will not cause harm or that they conform or will conform with any user expectations. Furthermore, the Company is not responsible for maintaining any materials referenced from another website, and makes no warranties for that website or service in such context.


                                        12.	COMPANY'S REMEDIES

                                        12.1. If any Participant breaches any provision in these Terms or is discovered
                                        or deemed to be ineligible or disqualified for the $PCH Airdrop Campaign for any
                                        reason, the Company is entitled at any time:

                                        (a) to withdraw, withhold, or require the forfeiture of any $PCH; or

                                        (b) where the $PCH has been delivered to the Participant, to reclaim such $PCH
                                        and/or claim liquidated damages from the Participant in an amount of two (2)
                                        times the market value of such $PCH.

                                        12.2.	Upon the occurrence of the above, no person shall be entitled to any payment or compensation from the Company.


                                        13.	ASSIGNMENT

                                        13.1.	You may not assign or transfer all or part of its rights or obligations under these Terms without the prior written consent of the Company. The Company may refuse to recognise any such assignment, transfer or any other transaction resembling such.

                                        13.2.	The Company may assign, as it sees fit and in its full discretion, any of its rights, obligations and duties under these Terms.


                                        14.	NO WAIVER

                                        14.1.	The Company’s failure or delay to exercise or enforce any right or provision of these Terms will not operate as a waiver of such right or provision, nor will any single or partial exercise of any right or remedy preclude any other or further exercise thereof or the exercise of any other right or remedy.

                                        14.2.	Any provision in these Terms may be waived by written and signed consent of the Company. A waiver of any provision or terms shall not be deemed a waiver of any breach of the provision or term, or any other provision or term.  For the avoidance of doubt, the Company may waive, by written and signed consent, any breach by any other Party to these Terms.


                                        15.	GOVERNING LAW AND DISPUTE RESOLUTION

                                        15.1.	These Terms are governed by the laws of the British Virgin Islands, without regard to conflict of law rules or principles (whether of the British Virgin Islands or any other jurisdiction) that would cause the application of the laws of any other jurisdiction.

                                        15.2.	Any dispute arising out of or related to these Terms, as well as any issue on its validity and existence, shall be referred to and finally resolved by confidential, arbitration administered in accordance with the BVI IAC Arbitration Rules for the time being in force, which rules are deemed to be incorporated by reference in this Clause 15. The place of arbitration shall be Road Town, Tortola, British Virgin Islands, unless the parties agree otherwise. The tribunal shall consist of 1 arbitrator agreed to by the parties within twenty (20) business days of receipt by the respondent of the request for arbitration or, in default thereof, appointed by the British Virgin Islands International Arbitration Centre in accordance with its prevailing rules. The arbitrator shall have exclusive authority to decide all issues relating to the interpretation, applicability, enforceability and scope of this arbitration agreement. The language of the arbitration shall be English. Each party irrevocably submits to the jurisdiction and venue of such tribunal. Judgment upon the award may be entered by any court having jurisdiction thereof or having jurisdiction over the relevant party or its assets.


                                        16.	ENTIRE AGREEMENT

                                        These Terms set forth the entire agreement and understanding between the Parties in connection with the matters dealt with and described herein, and supersedes all prior oral and written agreements, memoranda, understandings and undertakings between the Parties in connection with the matters dealt with and described herein.


                                        17.	THIRD PARTIES

                                        Save as expressly provided for in these Terms, a person who is not a party to these Terms has no right under any laws to enforce or to enjoy the benefit of any term of these Terms.


                                        18.	INVALIDITY AND SEVERANCE

                                        If any provision of these Terms shall be held to be illegal, void, invalid or unenforceable, the provision shall be deemed illegal, void, invalid or unenforceable to that extent. The remaining provisions of these Terms shall remain fully valid, legal and enforceable to the extent that they are unaffected by the defective provision, and the illegality, invalidity or unenforceability of the defective provision in one jurisdiction does not affect its legality, validity and enforceability under any other jurisdiction. The Parties agree to use all commercially reasonable efforts to explore other means of achieving the same result as if the provision had been entirely valid, legal and enforceable.
                                    </p>
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex flex-col">
                                <div className="w-full flex flex-row mb-4">
                                    <Checkbox  isSelected={isSelected} onValueChange={setIsSelected}/>
                                    <span className="text-white-80">I accept the terms & conditions</span>
                                </div>
                                <Button className={`pichi-button ${!isSelected || loading ? "grayscale" : ""}`}
                                        onClick={claim}
                                        disabled={!isSelected || isPending || loading || stakeLoading}>
                                    {loading && <Spinner color="default" size={"sm"}/>}Claim
                                </Button>
                                <Button className={`pichi-button ${!isSelected || stakeLoading ? "grayscale" : ""}`}
                                        onClick={claimStake}
                                        disabled={!isSelected || isPending || stakeLoading || loading}>
                                    {stakeLoading && <Spinner color="default" size={"sm"}/>}Claim and Stake
                                </Button>
                                <span className="block mb-4 text-white-70">Stake your PCH to earn 3x Pichi Points. Unstake after 15 days</span>
                                <Button className="pichi-button-empty" onClick={onClose} disabled={loading}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ClaimNow;

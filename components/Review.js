import { getProgram } from "@/utils/program";
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { SystemProgram } from "@solana/web3.js";
import { useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import toast from 'react-hot-toast';

export const Review = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [restaurant, setRestaurant] = useState();
    const [review, setReview] = useState();
    const [rating, setRating] = useState();

    const program = useMemo(()=>{
        if(wallet.publicKey){
            return getProgram(connection, wallet);
        }
    },[connection, wallet]);

    console.log("Program",program)

    const submitReview = async () => {
        try {
            if (!program) {
                toast.error("No program!")
                return;
            }
            if (!wallet) {
                toast.error("No wallet!")
                return;
            }
            if(!restaurant || !review || !rating) {
                toast.error("Input missing!")
                return;
            }
            const [PDA] = PublicKey.findProgramAddressSync(
                [Buffer.from(restaurant), wallet.publicKey.toBuffer()],
                program.programId
            );

            console.log("PDA: ", PDA.toBase58());

            const transaction = await program.methods.postReview(
                restaurant, 
                review, 
                rating
            ).accounts({
                review: PDA,
                signer: wallet.publicKey,
                systemProgram: SystemProgram.programId
            }).transaction();

            // set fee payer
            transaction.feePayer = wallet.publicKey;
            // get latest blockhash
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            // sign transaction
            const signedTx = await wallet.signTransaction(transaction);
            console.log("Signed Transaction", signedTx);
            // send transaction
            const txId = await connection.sendRawTransaction(signedTx.serialize());
            console.log("Transaction ID", txId);
            // confirmTransaction returns a signature
            const signature = await connection.confirmTransaction(txId, "confirmed");

            toast.success("Review posted!")

        } catch(err) {
            toast.error("Error Occurred");
            console.log("Error : PostReview : ", err);
        }
    }

    const fetchReviews = async () => {
        try {
            const data = await program.account.review.all()
            console.log(data);
        } catch(err) {
            console.log("Error : FetchReview : ", err)
        }
    }

    return <div className="grid h-full place-items-center">
        <label className="w-96 block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Restaurant Name</label>
        <input onChange={(e)=>{setRestaurant(e.target.value)}} className="w-96 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Hotel California" required />
        <label className="w-96 block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Review</label>
        <textarea onChange={(e)=>{setReview(e.target.value)}} className="w-96 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="You can check in anytime..."></textarea>
        <label className="w-96 block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a number:</label>
        <input onChange={(e)=>{setRating(parseInt(e.target.value))}} type="number" aria-describedby="helper-text-explanation" className="w-96 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="0" required />
        <button onClick={submitReview} type="button" className="mt-8 text-gray-900 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Submit</button>
        <button onClick={fetchReviews} type="button" className="mt-8 text-gray-900 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Fetch Reviews</button>
    </div>
}
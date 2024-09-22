import { Box, Spinner } from "@0xsequence/design-system";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import "./style.css";

const SeasonPassCFKV = () => {
  const { address } = useAccount();
  const [isInitd, setIsInitd] = useState(false);
  const {
    isPending: isEncoding,
    data: signedMessage,
    signMessage,
  } = useSignMessage();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  const [seasonPass, setSeasonPass] = useState("unknown");
  useEffect(() => {
    if (address && signedMessage && !isInitd) {
      fetch("api/seasonpass", {
        headers: {
          authorization: `${address}:${signedMessage}`,
        },
      })
        .then((response) => {
          response.json().then((d) => {
            setSeasonPass(d.result);
            setIsInitd(true);
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [address, isInitd, seasonPass, signedMessage]);

  useEffect(() => {
    if (address && !signedMessage && !isEncoding && !isInitd) {
      signMessage({ message: "let me in" });
    }
  }, [address, isEncoding, isInitd, signMessage, signedMessage]);

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        gap="8"
        marginBottom="8"
        justifyContent="center"
      >
        <div className="season-pass-title">SEASON PASS</div>
        <div data-owned={seasonPass} className="season-pass-indicator">
          {isEncoding || !isInitd || isPurchasing || isBurning
            ? "PLEASE WAIT"
            : seasonPass === "true"
              ? "OWNED"
              : "NOT OWNED"}
        </div>
        <button
          className="purchase"
          onClick={() => {
            if (seasonPass !== "false" || isPurchasing) {
              return;
            }
            setIsPurchasing(true);
            setSeasonPass("unknown");
            fetch("api/seasonpass", {
              method: "POST",
              headers: {
                authorization: `${address}:${signedMessage}`,
              },
              body: JSON.stringify({
                action: "buy",
              }),
            })
              .then((response) => {
                response.json().then((d) => {
                  setSeasonPass(d.result);
                  setIsPurchasing(false);
                });
              })
              .catch((e) => {
                console.log(e);
                setTimeout(() => {
                  setIsPurchasing(false);
                }, 5000);
              });
          }}
          type="button"
          disabled={
            isEncoding || !isInitd || isPurchasing || seasonPass !== "false"
          }
        >
          {isEncoding || !isInitd || isPurchasing ? <Spinner /> : "BUY"}
        </button>
        <button
          className="burn"
          onClick={() => {
            if (seasonPass !== "true" || isBurning) {
              return;
            }
            setIsBurning(true);
            setSeasonPass("unknown");
            fetch("api/seasonpass", {
              method: "POST",
              headers: {
                authorization: `${address}:${signedMessage}`,
              },
              body: JSON.stringify({
                action: "burn",
              }),
            })
              .then((response) => {
                response.json().then((d) => {
                  setSeasonPass(d.result);
                  setIsBurning(false);
                });
              })
              .catch((e) => {
                console.log(e);
                setTimeout(() => {
                  setIsBurning(false);
                }, 5000);
              });
          }}
          type="button"
          disabled={
            isEncoding || !isInitd || isBurning || seasonPass !== "true"
          }
        >
          {isEncoding || !isInitd || isBurning ? <Spinner /> : "BURN"}
        </button>
      </Box>
    </>
  );
};

export default SeasonPassCFKV;

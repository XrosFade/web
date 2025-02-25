import { Amount } from './TransactionDetails/Amount'
import { TransactionDetailsContainer } from './TransactionDetails/Container'
import { Row } from './TransactionDetails/Row'
import { Status } from './TransactionDetails/Status'
import { TransactionId } from './TransactionDetails/TransactionId'
import { Transfers } from './TransactionDetails/Transfers'
import { TxGrid } from './TransactionDetails/TxGrid'
import { TransactionGenericRow } from './TransactionGenericRow'
import { TransactionRowProps } from './TransactionRow'
import { AssetTypes, parseRelevantAssetFromTx } from './utils'

export const TransactionReceive = ({
  txDetails,
  showDateAndGuide,
  compactMode,
  toggleOpen,
  isOpen,
  parentWidth
}: TransactionRowProps) => {
  return (
    <>
      <TransactionGenericRow
        type={txDetails.type}
        toggleOpen={toggleOpen}
        compactMode={compactMode}
        blockTime={txDetails.tx.blockTime}
        symbol={txDetails.symbol}
        assets={[parseRelevantAssetFromTx(txDetails, AssetTypes.Destination)]}
        fee={
          txDetails.tx?.fee &&
          txDetails.feeAsset &&
          parseRelevantAssetFromTx(txDetails, AssetTypes.Fee)
        }
        explorerTxLink={txDetails.explorerTxLink}
        txid={txDetails.tx.txid}
        showDateAndGuide={showDateAndGuide}
        parentWidth={parentWidth}
      />
      <TransactionDetailsContainer isOpen={isOpen} compactMode={compactMode}>
        <Transfers compactMode={compactMode} transfers={txDetails.tx.transfers} />
        <TxGrid compactMode={compactMode}>
          <TransactionId explorerTxLink={txDetails.explorerTxLink} txid={txDetails.tx.txid} />
          <Row title='status'>
            <Status status={txDetails.tx.status} />
          </Row>
          <Row title='minerFee'>
            <Amount
              value={txDetails.tx.fee?.value ?? '0'}
              precision={txDetails.feeAsset?.precision ?? 0}
              symbol={txDetails.feeAsset?.symbol ?? ''}
            />
          </Row>
        </TxGrid>
      </TransactionDetailsContainer>
    </>
  )
}

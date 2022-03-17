import { Box } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { matchPath, MemoryRouter, Redirect, Route, Switch } from 'react-router'
import { SlideTransition } from 'components/SlideTransition'

import { FiatRampAction } from '../const'
import { GemCurrency } from '../FiatRamps'
import { AssetSelect } from './AssetSelect'
import { GemOverview } from './GemOverview'

export const entries = ['/buy', '/buy/select', '/sell', '/sell/select']

export const GemManagerRoutes = (props: any) => {
  const { location, history } = props

  const [selectedAsset, setSelectedAsset] = useState<GemCurrency | null>(null)
  const [isBTC, setIsBTC] = useState<boolean | null>(null)
  // We fetch Bitcoin address in manager so that we don't have to check for BTC support on every <GemOverview /> mount
  const [btcAddress, setBtcAddress] = useState<string | null>(null)
  const match = matchPath<{ fiatRampAction: FiatRampAction }>(location.pathname, {
    path: '/:fiatRampAction'
  })
  const handleFiatRampActionClick = (fiatRampAction: FiatRampAction) => {
    const route = fiatRampAction === FiatRampAction.Buy ? '/buy/' : '/sell/'
    setSelectedAsset(null)
    history.push(route)
  }
  const handleAssetSelect = (asset: GemCurrency, isBTC: boolean) => {
    const route = match?.params.fiatRampAction === FiatRampAction.Buy ? '/buy/' : '/sell/'
    setSelectedAsset(asset)
    setIsBTC(isBTC)
    history.push(route)
  }
  const handleIsSelectingAsset = (supportsBTC: Boolean, selectAssetTranslation: string) => {
    const route =
      match?.params.fiatRampAction === FiatRampAction.Buy ? '/buy/select' : '/sell/select'
    history.push(route, { supportsBTC, selectAssetTranslation })
  }

  return (
    <AnimatePresence exitBeforeEnter initial={false}>
      <Switch location={location} key={location.key}>
        <Route exact path='/:fiatRampAction'>
          <GemOverview
            {...props}
            selectedAsset={selectedAsset}
            onIsSelectingAsset={handleIsSelectingAsset}
            onFiatRampActionClick={handleFiatRampActionClick}
            btcAddress={btcAddress}
            setBtcAddress={setBtcAddress}
            isBTC={isBTC}
          />
        </Route>
        <Route exact path='/:fiatRampAction/select'>
          <AssetSelect {...location.state} onAssetSelect={handleAssetSelect} />
        </Route>
        <Redirect from='/' to='/buy' />
      </Switch>
    </AnimatePresence>
  )
}

export const GemManager = () => {
  return (
    <SlideTransition>
      <MemoryRouter initialEntries={entries}>
        <Box m={4} width={'24rem'}>
          <Switch>
            <Route path='/' component={GemManagerRoutes} />
          </Switch>
        </Box>
      </MemoryRouter>
    </SlideTransition>
  )
}

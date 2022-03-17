import { Box } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import { MemoryRouter, Redirect, Route, Switch } from 'react-router'
import { SlideTransition } from 'components/SlideTransition'

import { AssetSelect } from './AssetSelect'
import { GemManager } from './GemManager'

export const entries = ['/buy', '/buy/select', '/sell', '/sell/select']

export const GemManagerRoutes = (props: any) => {
  const { location } = props
  return (
    <AnimatePresence exitBeforeEnter initial={false}>
      <Switch location={location} key={location.key}>
        <Route exact path='/:fiatRampAction'>
          <GemManager {...props} />
        </Route>
        <Route exact path='/:fiatRampAction/select'>
          <AssetSelect {...location.state} />
        </Route>
        <Redirect from='/' to='/buy' />
      </Switch>
    </AnimatePresence>
  )
}

export const GemManagerRouter = () => {
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

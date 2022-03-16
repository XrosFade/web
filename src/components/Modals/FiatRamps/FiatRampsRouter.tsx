import { AnimatePresence } from 'framer-motion'
import { Route, Switch, useLocation } from 'react-router-dom'

import { FiatRampsRoutes } from './FiatRamps'
import { GemManagerRouter } from './views/GemManagerRouter'
import { RampsList } from './views/RampsList'

export const FiatRampsRouter = () => {
  const location = useLocation()
  return (
    <AnimatePresence exitBeforeEnter initial={false}>
      <Switch location={location} key={location.key}>
        <Route exact path={FiatRampsRoutes.Select} component={RampsList} />
        <Route exact path={FiatRampsRoutes.Gem} component={GemManagerRouter} />
      </Switch>
    </AnimatePresence>
  )
}

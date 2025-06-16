import { ResolveFn } from '@angular/router';

export const onBoardingResolver: ResolveFn<any> = (route, state) => {
  let flowType = route.queryParamMap.get('flow');
  let obj = {
    flowType: flowType,
    url: state.url
  }
  // return
  return obj;
};

import { Then, When, expect } from '@fixtures';
import { logger } from '@utils';

let launchesResult: any = null;
let savedLaunchId: string | null = null;
let singleLaunch: any = null;
let bookingResult: any = null;
let loginResult: any = null;
let cancelResult: any = null;

When('I fetch launches with limit {int}', async ({ apolloClient }, limit: number) => {
  launchesResult = await apolloClient.getLaunches(limit);
});

Then('the launches list should have at least {int} item', async ({}, expected: number) => {
  expect(launchesResult).toBeDefined();
  expect(Array.isArray(launchesResult.launches)).toBeTruthy();
  expect(launchesResult.launches.length).toBeGreaterThan(expected - 1);
});

When('I save the first launch id', async ({}) => {
  if (!launchesResult) throw new Error('No launches result available to save id from');
  // Support both shapes: { launches: [...] } or an array directly
  const arr = Array.isArray(launchesResult.launches)
    ? launchesResult.launches
    : Array.isArray(launchesResult)
      ? launchesResult
      : // maybe nested under `launches.launches`
        (launchesResult.launches?.launches ?? null);

  if (!arr || arr.length === 0) {
    throw new Error(`No launches found in result: ${JSON.stringify(launchesResult)}`);
  }
  // Debug output to help diagnose shape issues during test runs

  logger.info(`launchesResult (debug): ${JSON.stringify(launchesResult, null, 2)}`);

  logger.info(`chosen launch object (debug): ${JSON.stringify(arr[0], null, 2)}`);
  savedLaunchId = arr[0].id;
});

When('I fetch launch by saved id', async ({ apolloClient }) => {
  if (!savedLaunchId) throw new Error('No saved launch id');
  singleLaunch = await apolloClient.getLaunch(savedLaunchId);
});

Then('the launch id should equal saved id', async ({}) => {
  expect(singleLaunch.id).toBe(savedLaunchId);
});

Then('the launch mission name should be defined', async ({}) => {
  expect(singleLaunch.mission?.name).toBeDefined();
});

When('I book trip for saved launch', async ({ apolloClient }) => {
  if (!savedLaunchId) throw new Error('No saved launch id');

  logger.info(`booking with id (debug): ${savedLaunchId}`);
  try {
    bookingResult = await apolloClient.bookTrips([savedLaunchId]);
  } catch (err) {
    logger.error('bookTrips threw error:', err);

    logger.error('booking payload was:', JSON.stringify([savedLaunchId]));
    throw err;
  }
});

Then('the booking should be successful', async ({}) => {
  expect(bookingResult).toBeDefined();
  expect(bookingResult.success).toBeTruthy();
  expect(bookingResult.launches[0].isBooked).toBeTruthy();
});

When('I login with email {string}', async ({ apolloClient }, email: string) => {
  loginResult = await apolloClient.login(email);
});

Then(
  'the login result should contain id and token and email {string}',
  async ({}, email: string) => {
    expect(loginResult).toBeDefined();
    expect(loginResult.id).toBeDefined();
    expect(loginResult.token).toBeDefined();
    expect(loginResult.email).toBe(email);
  },
);

When('I cancel booked trip for saved launch', async ({ apolloClient }) => {
  if (!savedLaunchId) throw new Error('No saved launch id');
  cancelResult = await apolloClient.cancelTrip(savedLaunchId);
});

Then('the cancellation should be successful', async ({}) => {
  expect(cancelResult).toBeDefined();
  expect(cancelResult.success).toBeTruthy();
  expect(cancelResult.launches[0].isBooked).toBeFalsy();
});

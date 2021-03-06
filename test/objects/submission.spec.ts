import ava, { TestInterface } from 'ava';
import { RequiredArgumentError } from '../../src/errors/required-argument-erorr';
import { Submission } from '../../src/objects/submission';
import { SnooWrapped } from '../../src/snoo-wrapped';
import { credentials } from '../_helpers/credentials';
import { mockServer } from '../_helpers/mock-fetch';

const test = ava as TestInterface<{
    snooWrapped: SnooWrapped;
}>;

test.before(t => {
    // Enable API mocking
    mockServer.listen();

    // Add context
    t.context = {
        snooWrapped: new SnooWrapped(credentials)
    };
});

// Reset any runtime request handlers we may add during the tests.
test.afterEach(() => mockServer.resetHandlers());

// Disable API mocking after the tests are done.
test.after(() => mockServer.close());

test('constructor', t => {
    const { snooWrapped } = t.context;

    // OK
    t.notThrows(() => {
        new Submission({ name: '2np694' }, snooWrapped);
    });

    // Missing "name"
    t.throws(() => {
        // @ts-expect-error
        new Submission({}, snooWrapped);
    }, { instanceOf: RequiredArgumentError });

    // Missing "snooWrapped"
    t.throws(() => {
        // @ts-expect-error
        new Submission({});
    }, { instanceOf: RequiredArgumentError });
});

test.serial('fetch()', async t => {
    const { snooWrapped } = t.context;

    // OK
    t.notThrows(async () => {
        await snooWrapped.getSubmission('2np694').fetch();
    });

    // Returns an unfetched "Submission"
    const submission = snooWrapped.getSubmission('2np694');
    t.not(submission, undefined);
    t.true(submission instanceof Submission);
    t.is(submission.name, 't3_2np694');
    t.is(submission.title, undefined);
    t.is(submission.author, undefined);
    t.is(submission.votes.up, undefined);
    t.is(submission.votes.down, undefined);
    t.is(submission.created, undefined);
    t.is(submission.edited, undefined);
    t.is(submission.gilded, undefined);
    t.is(submission.subredditType, undefined);
    t.is(submission.domain, undefined);
    t.is(submission.body, undefined);
    t.is(submission.archived, undefined);
    t.is(submission.nsfw, undefined);
    t.is(submission.comments, undefined);

    // Returns a fetched "Submission"
    const fetchedSubmission = await submission.fetch();
    t.not(fetchedSubmission, undefined);
    t.true(fetchedSubmission instanceof Submission);
    t.is(fetchedSubmission.name, 't3_2np694');
    t.is(fetchedSubmission.title, 'What tasty food would be distusting if eaten over rice?');
    t.is(fetchedSubmission.author?.name, 'DO_U_EVN_SPAGHETTI');
    t.true((fetchedSubmission.votes.up || 0) >= 57000);
    t.is(fetchedSubmission.votes.down, 0);
    t.deepEqual(fetchedSubmission.created, new Date('2014-11-28 21:07:58 UTC'));
    t.deepEqual(fetchedSubmission.edited, new Date('2014-11-29 09:02:03 UTC'));
    t.is(fetchedSubmission.gilded, 14);
    t.is(fetchedSubmission.subredditType, 'public');
    t.is(fetchedSubmission.domain, 'self.AskReddit');
    t.is(fetchedSubmission.body, '');
    t.true(fetchedSubmission.archived);
    t.false(fetchedSubmission.nsfw);
    // Comments are currently being reworked
    // t.is(fetchedSubmission.comments?.length, 93);
});

test.serial('markNsfw()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.nsfw, undefined);

    // Mark NSFW
    const updatedSubmission = await submission.markNsfw();

    // Now Submission is marked as NSFW
    t.true(updatedSubmission.nsfw);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.true(fetchedSubmission.nsfw);
});

test.serial('unmarkNsfw()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.nsfw, undefined);

    // Unmark NSFW
    const updatedSubmission = await submission.unmarkNsfw();

    // Now Submission is marked as SFW
    t.false(updatedSubmission.nsfw);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.false(fetchedSubmission.nsfw);
});

test.serial('lock()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.locked, undefined);

    // Lock
    const updatedSubmission = await submission.lock();

    // Now Submission is locked
    t.true(updatedSubmission.locked);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.true(fetchedSubmission.locked);
});

test.serial('unlock()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.locked, undefined);

    // Unlock
    const updatedSubmission = await submission.unlock();

    // Now Submission is unlocked
    t.false(updatedSubmission.locked);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.false(fetchedSubmission.locked);
});

test.serial('hide()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.hidden, undefined);

    // Hide
    const updatedSubmission = await submission.hide();

    // Now Submission is hidden
    t.true(updatedSubmission.hidden);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.true(fetchedSubmission.hidden);
});

test.serial('unhide()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.hidden, undefined);

    // Unhide
    const updatedSubmission = await submission.unhide();

    // Now Submission is hidden
    t.false(updatedSubmission.hidden);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.false(fetchedSubmission.hidden);
});

test.serial('spoiler()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.spoilered, undefined);

    // Hide
    const updatedSubmission = await submission.spoiler();

    // Now Submission is spoilered
    t.true(updatedSubmission.spoilered);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.true(fetchedSubmission.spoilered);
});

test.serial('unspoiler()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.spoilered, undefined);

    // Unhide
    const updatedSubmission = await submission.unspoiler();

    // Now Submission is unspoilered
    t.false(updatedSubmission.spoilered);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.false(fetchedSubmission.spoilered);
});

test.serial('sticky()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.stickied, undefined);

    // Requires slot
    t.throwsAsync(async () => {
        // @ts-expect-error
        await submission.sticky();
    }, { instanceOf: RequiredArgumentError });

    // Requires positive number
    t.throwsAsync(async () => {
        // @ts-expect-error
        await submission.sticky(-1);
    }, { instanceOf: RequiredArgumentError });

    // Requires 1 or 2
    t.throwsAsync(async () => {
        // @ts-expect-error
        await submission.sticky(3);
    }, { instanceOf: RequiredArgumentError });

    // Requires a number
    t.throwsAsync(async () => {
        // @ts-expect-error
        await submission.sticky('');
    }, { instanceOf: RequiredArgumentError });

    // Can't sticky non-existent submission
    const nonExistentSubmission = snooWrapped.getSubmission('aaaaaa');
    t.throwsAsync(async () => {
        await nonExistentSubmission.sticky(1);
    }, { message: '403 Forbidden' });

    // Sticky
    const updatedSubmission = await submission.sticky(1);

    // Now Submission is stickied
    t.true(updatedSubmission.stickied);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.true(fetchedSubmission.stickied);
});

test.serial('unsticky()', async t => {
    const { snooWrapped } = t.context;

    // Can't unsticky non-existent submission
    const nonExistentSubmission = snooWrapped.getSubmission('aaaaaa');
    t.throwsAsync(async () => {
        await nonExistentSubmission.unsticky();
    }, { message: '403 Forbidden' });

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.stickied, undefined);

    // Unsticky
    const updatedSubmission = await submission.unsticky();

    // Now Submission is unstickied
    t.false(updatedSubmission.stickied);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.false(fetchedSubmission.stickied);
});

test.serial('remove()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.removed, undefined);

    // Remove
    const updatedSubmission = await submission.remove();

    // Now Submission is removed
    t.true(updatedSubmission.removed);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.is(fetchedSubmission.removed?.by, 'TestAccount123');
    t.is(fetchedSubmission.removed?.reason, null);
    t.is(fetchedSubmission.removed?.category, 'moderator');
});

test.serial('remove({ spam: true })', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.removed, undefined);

    // Remove
    const updatedSubmission = await submission.remove({ spam: true });

    // Now Submission is removed
    t.true(updatedSubmission.removed);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.is(fetchedSubmission.removed?.by, 'TestAccount123');
    t.is(fetchedSubmission.removed?.reason, null);
    t.is(fetchedSubmission.removed?.category, 'moderator');
});

test.serial('approve()', async t => {
    const { snooWrapped } = t.context;

    // Get submission
    const submission = snooWrapped.getSubmission('ovklvg');
    t.is(submission.removed, undefined);

    // Approve
    const updatedSubmission = await submission.approve();

    // Now Submission is approved
    t.is(updatedSubmission.removed, undefined);

    // Double check it was actually updated on Reddit
    const fetchedSubmission = await updatedSubmission.fetch();
    t.is(fetchedSubmission.removed, undefined);
});

test.serial('Submission.fetchRandom()', async t => {
    const { snooWrapped } = t.context;

    // Fetch random submission
    const randomFetchedSubmission = await Submission.fetchRandom(snooWrapped);
    t.not(randomFetchedSubmission, undefined);
    t.true(randomFetchedSubmission instanceof Submission);
    t.is(randomFetchedSubmission.name, 't3_ayvt9u');
    t.is(randomFetchedSubmission.title, 'Looking for friendly, more chill chats? Check out our sister sub - it\'s like this sub but more casual... r/CasualConversation');
    t.is(randomFetchedSubmission.author?.name, 'tizorres');
    t.is(randomFetchedSubmission.votes.up, 20);
    t.is(randomFetchedSubmission.votes.down, 0);
    t.deepEqual(randomFetchedSubmission.created, new Date('2019-03-08 21:50:07 UTC'));
    t.deepEqual(randomFetchedSubmission.edited, undefined);
    t.is(randomFetchedSubmission.gilded, 0);
    t.is(randomFetchedSubmission.subredditType, 'public');
    t.is(randomFetchedSubmission.domain, 'reddit.com');
    t.is(randomFetchedSubmission.body, '');
    t.true(randomFetchedSubmission.archived);
    t.false(randomFetchedSubmission.nsfw);
});
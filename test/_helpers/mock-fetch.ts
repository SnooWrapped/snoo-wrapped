import { rest } from 'msw';
import { setupServer } from 'msw/node';
import * as info from '../_mocks/oauth.reddit.com/api/info';
import * as askRedditArticle from '../_mocks/r/AskReddit/comments/article';
import * as publicSfwSubArticle from '../_mocks/r/public_sfw_sub/comments/article';
import { About as OmgImAlexisAbout } from '../_mocks/user/OmgImAlexis/about';
import { About as AskRedditAbout } from '../_mocks/r/AskReddit/about';
import { About as PhoenixStarshipAbout } from '../_mocks/oauth.reddit.com/user/phoenix_starship/about';
import { Random as RandomSubmission } from '../_mocks/r/random';
import { NewSubmissions as AskRedditNewSubmissions } from '../_mocks/r/AskReddit/new';

const errors = {
    403: {
        "message": "Forbidden",
        "error": 403
    }
}

export const mockServer = setupServer(
    rest.post('https://www.reddit.com/api/v1/access_token', (req, res, ctx) => {
        return res(ctx.json({
            access_token: 'mocked_user_token',
            expires_in: 3600,
            scope: '*',
            token_type: 'bearer'
        }));
    }),
    rest.get('https://oauth.reddit.com/api/info/', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        return res(ctx.json(info[id]));
    }),
    rest.post('https://oauth.reddit.com/api/marknsfw', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        if (!(id in info)) return res(ctx.json(errors[403]));
        info[id].data.children[0].data.over_18 = true;
        return res(ctx.json({}));
    }),
    rest.post('https://oauth.reddit.com/api/unmarknsfw', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        if (!(id in info)) return res(ctx.json(errors[403]));
        info[id].data.children[0].data.over_18 = false;
        return res(ctx.json({}));
    }),
    rest.post('https://oauth.reddit.com/api/lock', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        if (!(id in info)) return res(ctx.json(errors[403]));
        info[id].data.children[0].data.locked = true;
        return res(ctx.json({}));
    }),
    rest.post('https://oauth.reddit.com/api/unlock', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        if (!(id in info)) return res(ctx.json(errors[403]));
        info[id].data.children[0].data.locked = false;
        return res(ctx.json({}));
    }),
    rest.post('https://oauth.reddit.com/api/hide', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        if (!(id in info)) return res(ctx.json(errors[403]));
        info[id].data.children[0].data.hidden = true;
        return res(ctx.json({}));
    }),
    rest.post('https://oauth.reddit.com/api/unhide', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        if (!(id in info)) return res(ctx.json(errors[403]));
        info[id].data.children[0].data.hidden = false;
        return res(ctx.json({}));
    }),
    rest.post('https://oauth.reddit.com/api/spoiler', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        if (!(id in info)) return res(ctx.json(errors[403]));
        info[id].data.children[0].data.spoiler = true;
        return res(ctx.json({}));
    }),
    rest.post('https://oauth.reddit.com/api/unspoiler', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        if (!(id in info)) return res(ctx.json(errors[403]));
        info[id].data.children[0].data.spoiler = false;
        return res(ctx.json({}));
    }),
    rest.post('https://oauth.reddit.com/api/set_subreddit_sticky', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        if (!(id in info)) return res(ctx.json(errors[403]));
        const slot = req.url.searchParams.get('num');
        info[id].data.children[0].data.stickied = slot === '1' || slot === '2';
        return res(ctx.json({}));
    }),
    rest.get('https://oauth.reddit.com/r/AskReddit/comments/article', (req, res, ctx) => {
        const article = req.url.searchParams.get('article');
        return res(ctx.json(askRedditArticle[`t3_${article}`]));
    }),
    rest.get('https://oauth.reddit.com/r/public_sfw_sub/comments/article', (req, res, ctx) => {
        const article = req.url.searchParams.get('article');
        return res(ctx.json(publicSfwSubArticle[`t3_${article}`]));
    }),
    rest.get('https://oauth.reddit.com/user/OmgImAlexis/about', (_req, res, ctx) => {
        return res(ctx.json(OmgImAlexisAbout));
    }),
    rest.get('https://oauth.reddit.com/r/AskReddit/about', (_req, res, ctx) => {
        return res(ctx.json(AskRedditAbout));
    }),
    rest.get('https://oauth.reddit.com/r/AskReddit/new', (_req, res, ctx) => {
        return res(ctx.json(AskRedditNewSubmissions));
    }),
    rest.get('https://oauth.reddit.com/user/phoenix_starship/about', (_req, res, ctx) => {
        return res(ctx.json(PhoenixStarshipAbout));
    }),
    rest.get('https://oauth.reddit.com/r/random', (_req, res, ctx) => {
        return res(ctx.json(RandomSubmission));
    }),
    rest.post('https://oauth.reddit.com/api/remove', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        const spam = req.url.searchParams.get('spam');
        if (!(id in info)) return res(ctx.json(errors[403]));
        info[id].data.children[0].data.removed_by = 'TestAccount123';
        info[id].data.children[0].data.removed_by_category = 'moderator';
        info[id].data.children[0].data.ban_note = spam ? 'spam' : 'remove not spam';
        return res(ctx.json({}));
    }),
    rest.post('https://oauth.reddit.com/api/approve', (req, res, ctx) => {
        const id = req.url.searchParams.get('id');
        if (!(id in info)) return res(ctx.json(errors[403]));
        info[id].data.children[0].data.removed_by = undefined;
        info[id].data.children[0].data.removed_by_category = undefined;
        info[id].data.children[0].data.ban_note = undefined;
        return res(ctx.json({}));
    }),
);
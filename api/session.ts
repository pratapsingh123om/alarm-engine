import { withSupabase } from '@supabase/server';

export default {
  fetch: withSupabase({ auth: 'user' }, async (_request, context) => {
    return Response.json({
      authenticated: true,
      user: {
        id: context.userClaims!.id,
        email: context.userClaims!.email,
      },
    });
  }),
};

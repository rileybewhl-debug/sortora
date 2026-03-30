const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { setSecurityHeaders, alertError } = require('./_security');
const emails = require('./_emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var FROM = process.env.EMAIL_FROM || 'Riley from Sortora <riley@sortora.com>';

// Called after split/payment events to check if a milestone was hit.
// POST { businessId, eventType: 'split'|'payment', totalSplits, totalRevenue }
module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    var { businessId, totalSplits, totalRevenue } = req.body;
    if (!businessId) return res.status(400).json({ error: 'businessId required' });

    var { data: biz } = await supabase
      .from('businesses')
      .select('email, owner_name, business_name, milestones_sent')
      .eq('id', businessId)
      .single();
    if (!biz || !biz.email) return res.status(404).json({ error: 'Not found' });

    var sent = biz.milestones_sent || [];
    var name = biz.owner_name || biz.business_name || 'there';
    var milestones = [
      { key: 'first_split', check: totalSplits >= 1, title: 'Your first split!', message: 'You just completed your first split payment on Sortora. This is where it starts.', stat: '1', statLabel: 'split completed' },
      { key: 'ten_bookings', check: totalSplits >= 10, title: '10 bookings milestone!', message: biz.business_name + ' has hit double digits. You\u2019re building momentum.', stat: '10', statLabel: 'bookings completed' },
      { key: 'revenue_1k', check: totalRevenue >= 1000, title: '$1,000 processed!', message: 'You\u2019ve processed over $1,000 in split payments. The model is working.', stat: '$1K+', statLabel: 'total processed' },
      { key: 'revenue_10k', check: totalRevenue >= 10000, title: '$10,000 milestone!', message: 'Five figures in split payments. ' + biz.business_name + ' is thriving.', stat: '$10K+', statLabel: 'total processed' },
      { key: 'revenue_100k', check: totalRevenue >= 100000, title: '$100,000 processed!', message: 'Six figures. You\u2019re in a league of your own.', stat: '$100K+', statLabel: 'total processed' }
    ];

    var sentCount = 0;
    for (var m of milestones) {
      if (m.check && !sent.includes(m.key)) {
        var html = emails.milestone({ name: name, title: m.title, message: m.message, stat: m.stat, statLabel: m.statLabel });
        await resend.emails.send({
          from: FROM, to: biz.email,
          subject: m.title,
          html: html,
          tags: [{ name: 'category', value: 'milestone' }, { name: 'milestone', value: m.key }]
        });
        sent.push(m.key);
        sentCount++;
      }
    }

    if (sentCount > 0) {
      await supabase.from('businesses').update({ milestones_sent: sent }).eq('id', businessId);
    }

    return res.status(200).json({ sent: sentCount, milestones: sent });
  } catch (err) {
    alertError('milestone', err, req);
    return res.status(500).json({ error: 'Failed' });
  }
};

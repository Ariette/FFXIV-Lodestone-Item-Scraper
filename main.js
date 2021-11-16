const Apify = require('apify');

Apify.main(async () => {
    const requestList = await Apify.openRequestList('start-urls', [
        {
            "url": "https://na.finalfantasyxiv.com/lodestone/playguide/db/item/?page=1",
            "method": "GET"
        }
    ]);
    const requestQueue = await Apify.openRequestQueue();
    const proxyConfiguration = await Apify.createProxyConfiguration({ useApifyProxy: false });

    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        proxyConfiguration,
        maxConcurrency: 50,
        handlePageFunction: async (context) => {
            const { $, request, log } = context;
            const url = request.url;
        
            // Processing start page - add list page links to RequestQue
            if (url.indexOf('?page=1') != -1) {
                const lastPage = $('.next_all').first().find('a').prop('href');
                const maxPage = parseInt(lastPage.replace('https://na.finalfantasyxiv.com/lodestone/playguide/db/item/?page=','')) + 1;
                for (let i = 2; i < maxPage; i++) {
                    context.enqueueRequest({url: 'https://na.finalfantasyxiv.com/lodestone/playguide/db/item/?page=' + i});
                }
            }
        
            // Processing list page - add item detail page links to RequestQue
            if (url.indexOf('?page=') != -1) {
                $('#character').find('tr').find('.db-table__link_txt').find('a.db-table__txt--detail_link').each((idx, el) => {
                    const itemUrl = $(el).prop('href');
                    context.enqueueRequest({url: 'https://na.finalfantasyxiv.com' + itemUrl});
                });
                log.info('List Scraped', { url });
                return;
            }
        
            // Processing mob page - check Lv
            if (url.indexOf('/npc/enemy') != -1) {
                const id = url.replace(/.*\/lodestone\/playguide\/db\/npc\/enemy\/([a-f0-9]{11})\/?/, '$1');
                const lv = $('.db__l_main__view').find('td.db-table__body--light').text().trim().match(/Lv\. (.+)/);
        
                return {
                    type: 'mob',
                    id: id,
                    lv: lv ? lv[1] : undefined
                }
            }
        
            // Processing item detail page
            const name = $('h2.db-view__item__text__name').first().text().replace('\ue03c', '').replace('','').trim();
            const id = url.replace(/https:\/\/na.finalfantasyxiv.com\/lodestone\/playguide\/db\/item\/([a-f0-9]{11})\//, '$1');
            const acquires = [];
            const drops = [];
            const instances = [];
        
            // Processing Acquire
            const acquireList = $('div.db-view__data__inner--select_reward');
            if (acquireList.length) {
                const item = acquireList.first();
                const title = item.find('h4').text().trim();
                if (title == 'Acquired From') {
                    const list = item.find('li.db-view__data__item_list');
                    list.each(function() {
                        const name = $(this).find('.db-view__data__reward__item__name').text().replace('','').trim();
                        acquires.push(name);
                    })
                }
            }
        
            // Processing Drop & Instance
            const baseList = $('table.db-table');
            if (baseList.length) {
                baseList.each((index, base) => {
                    const $base = $(base);
                    const title = $base.find('th').first().text().trim();
                    if (title == 'Dropped By') {
                        const dropList = $base.find('tbody').find('tr');
                        dropList.each((idx, mob) => {
                            const head = $(mob).find('td.db-table__body--light').first().find('a.db-table__txt--detail_link').first();
                            const id = head.attr('href').replace(/.*\/lodestone\/playguide\/db\/npc\/enemy\/([a-f0-9]{11})\//,'$1');
                            const name = head.text().trim();
                            const location = $(mob).find('td.db-table__body--dark').first().text().trim().match(/(.*)\(X:(.*) Y:(.*)\)/);
                            const output = {
                                name: name,
                                id: id,
                                zone: location ? location[1].trim() : undefined,
                                x: location ? location[2] : undefined,
                                y: location ? location[3] : undefined
                            }
        
                            // Add mob data request
                            context.enqueueRequest({url: 'https://na.finalfantasyxiv.com/lodestone/playguide/db/npc/enemy/' + id});
                            drops.push(output);
                        })
                    } else if (title == 'Duty') {
                        const instanceList = $base.find('tbody').find('tr');
                        instanceList.each((idx, instance) => {
                            const name = $(instance).find('td.db-table__body--light').first().find('a.db-table__txt--detail_link').text().trim();
                            instances.push(name);
                        })
                    }
                })
            }
        
            // Return Results
            return {
                type: 'item',
                id: id,
                name: name,
                acquire: acquires.length > 0 ? acquires : undefined,
                drop: drops.length > 0 ? drops : undefined,
                instance: instances.length > 0 ? instances : undefined
            };
        },
    });

    await crawler.run();
});

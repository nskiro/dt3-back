var express = require('express');
var mongoose = require('mongoose');
const _ = require('lodash');

var router = express.Router();

const Menus = require('../../Schema/Auth/Menu');
const AccessLink = require('../../Schema/Auth/AccessLink');

findMenuNameById = (menu_id) => {
    return Menus.find({ _id: new mongoose.mongo.ObjectID(menu_id) });
}

findAccessLinkNameById = (access_link_id) => {
    return AccessLink.find({ _id: new mongoose.mongo.ObjectID(access_link_id) });
}

findMenuChildsByParent = (parent_id) => {
    return Menus.find({ menu_parent_id: new mongoose.mongo.ObjectID(parent_id) });
}

findMenuRoot = () => {
    return Menus.find({ record_status: 'O', menu_parent_id: null });
}

findMenus = () => {
    return Menus.find({ record_status: 'O' });
}
copyMenuData = (mi) => {
    console.log(mi)
    let item = {
        menu_label: mi.menu_label,
        extra_params: mi.extra_params,
        menu_parent_id: mi.menu_parent_id,
        access_link_id: mi.access_link_id,
        create_date: mi.create_date,
        update_date: mi.update_date,
        record_status: mi.record_status,
        key: mi._id,
        title: mi.menu_label,
        _id: mi._id,
        __v: mi.__v
    };
    if (mi.access_link_id) {
        if(mi.extra_params.length > 0){
            console.log(mi.access_link_id)
            let arrUrl = mi.access_link_id.name.split('/:')
            item.url = arrUrl[0]
            _.forEach(mi.extra_params, o => {
                item.url = item.url + '/' + o
            })
        }
        else{
            item.url = mi.access_link_id.name
        }
    }

    return item;
}

router.get('/get', (req, res, next) => {
    req.query.record_status = 'O';
    let cond = { ...req.query };
    if (cond.menu_parent) {
        cond.menu_parent_id = new mongoose.Types.ObjectId(cond.menu_parent);
        delete cond.menu_parent;
    }
    console.log(cond);
    Menus.find(cond)
        .sort({ 'menu_label': 'asc' })
        .exec((err, ms) => {
            if (!err) {
                return res.status(200).send({ valid: true, data: ms });
            }
            return res.status(200).send({ valid: false, message: err });
        })
})

router.get('/getwithlabels', (req, res, next) => {
    // req.query.record_status = 'O';
    let cond = { ...req.query };
    if (cond.menu_parent) {
        cond.menu_parent_id = new mongoose.Types.ObjectId(cond.menu_parent);
        delete cond.menu_parent;
    }
    Menus.find(cond)
        .populate({path: 'access_link_id', match: { record_status: 'O' }})
        .sort({ 'menu_label': 'asc' })
        .exec(async (err, ms) => {
            if (!err) {
                let data_returned = [];
                for (let i = 0; i < ms.length; i++) {
                    let item = copyMenuData(ms[i]);
                    if (item.menu_parent_id) {
                        let findMenuParent = await findMenuNameById(item.menu_parent_id);
                        if (findMenuParent.length > 0) { item.menu_parent_label = findMenuParent[0].menu_label; }
                    }
                    if (item.access_link_id) {
                        let findAccessLink = await findAccessLinkNameById(item.access_link_id._id);
                        if (findAccessLink.length > 0) { item.access_link_name = findAccessLink[0].name; }
                    }
                    data_returned.push(item);
                }
                data_returned.sort((a, b) => {
                    let a_p_label = a.menu_parent_label + "";
                    let b_p_label = b.menu_parent_label + "";
                    if (a_p_label.localeCompare(b_p_label) === 1) { return -1; }
                    else if (a_p_label.localeCompare(b_p_label) === 0) {
                        let a_label = a.menu_label + "";
                        let b_label = b.menu_label + "";
                        return (a_label.localeCompare(b_label));
                    }
                    return 1;
                });

                return res.status(200).send({ valid: true, data: data_returned });
            }
            return res.status(200).send({ valid: false, message: err });
        })
})

router.get('/getroot', (req, res, next) => {
    //req.query.record_status = 'O';
    let cond = { record_status: 'O', menu_parent_id: null };
    console.log(cond);
    Menus.find(cond)
        .sort({ 'menu_label': 'asc' })
        .exec(async (err, ms) => {
            if (!err) {
                let data_return = [];
                for (let i = 0; i < ms.length; i++) {
                    let item = copyMenuData(ms[i]);
                    let findChilds = await findMenuChildsByParent(item._id);
                    // /children
                    let child = [];
                    for (let j = 0; j < findChilds.length; j++) {
                        let ch = copyMenuData(findChilds[j]);
                        ch.key = ch._id;
                        ch.title = ch.menu_label;
                        child.push(ch);
                    }
                    item.children = child;
                    data_return.push(item);

                }
                return res.status(200).send({ valid: true, data: data_return });
            }
            return res.status(200).send({ valid: false, message: ms });
        })
})

router.post('/add/', (req, res, next) => {
    console.log(req.body);
    let ms = {};
    try {
        ms.menu_label = req.body.menu_label;
        if (req.body.access_link) { ms.access_link_id = new mongoose.Types.ObjectId(req.body.access_link); }
        else { ms.access_link_id = null; }

        if (req.body.menu_parent) { ms.menu_parent_id = new mongoose.Types.ObjectId(req.body.menu_parent); }
        else { ms.menu_parent_id = null; }
    } catch (ex) {
        console.log(ex);
        return res.status(200).send({ valid: false, message: ex });
    }

    Menus.create(ms, (err, ac_link) => {
        if (!err) {
            return res.status(200).send({ valid: true, data: ms });
        }
        return res.status(200).send({ valid: false, message: err });
    })
});


router.post(`/update/:id/`, (req, res, next) => {
    let id = req.params.id;
    let cond = { _id: new mongoose.Types.ObjectId(req.params.id), __v: req.params.v };
    let data = {
        update_date: new Date(),
        $inc: { __v: 1 }
    };

    try {
        data.menu_label = req.body.menu_label;
        if (req.body.access_link) { data.access_link_id = new mongoose.Types.ObjectId(req.body.access_link); }
        else { data.access_link_id = null; }

        if (req.body.menu_parent) { data.menu_parent_id = new mongoose.Types.ObjectId(req.body.menu_parent); }
        else { data.menu_parent_id = null; }
    } catch (ex) {
        console.log(ex);
        return res.status(200).send({ valid: false, message: ex });
    }
    console.log(data);
    Menus.findByIdAndUpdate(cond, data, (err, ms) => {
        if (!err) {

            return res.status(200).send({ valid: true, data: ms });
        }
        return res.status(200).send({ valid: false, message: err });

    })
});

router.post(`/enable/:id/`, (req, res, next) => {
    let id = req.params.id;
    let cond = { _id: new mongoose.Types.ObjectId(req.params.id), __v: req.params.v };
    let data = {
        record_status: 'O',
        update_date: new Date(),
        $inc: { __v: 1 }
    };

    Menus.findByIdAndUpdate(cond, data, (err, ms) => {
        if (!err) {
            return res.status(200).send({ valid: true, data: ms });
        }
        return res.status(200).send({ valid: false, message: err });

    })
});


router.post(`/disable/:id/`, (req, res, next) => {
    let id = req.params.id;
    let cond = { _id: new mongoose.Types.ObjectId(req.params.id), __v: req.params.__v };
    let data = {
        record_status: 'C',
        update_date: new Date(),
        $inc: { __v: 1 }
    };
    //return res.status(200).send({ valid: true, data: [] });
    Menus.findByIdAndUpdate(cond, data, (err, ms) => {
        if (!err) {
            return res.status(200).send({ valid: true, data: ms });
        }
        return res.status(200).send({ valid: false, message: err });

    });

});


module.exports = router;